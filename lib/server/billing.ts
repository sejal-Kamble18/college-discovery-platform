import { createHmac, timingSafeEqual } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getServerFirestore } from "@/lib/server/firebase-admin";
import type { BillingStatus, SubscriptionPlan, SubscriptionState } from "@/types";

export class BillingError extends Error {
  constructor(message: string, public readonly status = 500) {
    super(message);
    this.name = "BillingError";
  }
}

interface StripeResponse {
  id?: string;
  url?: string;
  error?: { message?: string };
}

export interface StripeEvent {
  id: string;
  type: string;
  created: number;
  data: { object: Record<string, unknown> };
}

function requiredEnvironment(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new BillingError(`${name} is not configured.`, 503);
  return value;
}

export function isBillingConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() &&
    process.env.STRIPE_WEBHOOK_SECRET?.trim() &&
    process.env.STRIPE_PRO_PRICE_ID?.trim() &&
    process.env.FIREBASE_ADMIN_PROJECT_ID?.trim() &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim() &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY?.trim(),
  );
}

export function getApplicationUrl(request: Request) {
  const configured = process.env.APP_URL?.trim();
  if (!configured && process.env.NODE_ENV === "production") {
    throw new BillingError("APP_URL is not configured.", 503);
  }
  const parsed = new URL(configured || new URL(request.url).origin);
  if (parsed.protocol !== "https:" && parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
    throw new BillingError("APP_URL must use HTTPS in production.", 503);
  }
  return parsed.origin;
}

export async function stripePost(
  path: string,
  parameters: URLSearchParams,
  idempotencyKey?: string,
): Promise<StripeResponse> {
  const secretKey = requiredEnvironment("STRIPE_SECRET_KEY");
  const headers: HeadersInit = {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  if (process.env.STRIPE_API_VERSION?.trim()) headers["Stripe-Version"] = process.env.STRIPE_API_VERSION.trim();

  const response = await fetch(`https://api.stripe.com/v1/${path.replace(/^\//, "")}`, {
    method: "POST",
    headers,
    body: parameters,
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  const body = (await response.json()) as StripeResponse;
  if (!response.ok) {
    if (process.env.NODE_ENV !== "production") console.error("Stripe API error:", body.error?.message || response.status);
    throw new BillingError("The secure billing service could not complete this request.", response.status >= 500 ? 503 : 400);
  }
  return body;
}

export function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1_000),
) {
  const parts = signatureHeader.split(",");
  const timestamp = Number(parts.find((part) => part.startsWith("t="))?.slice(2));
  const signatures = parts.filter((part) => part.startsWith("v1=")).map((part) => part.slice(3));
  if (!Number.isFinite(timestamp) || signatures.length === 0 || Math.abs(nowSeconds - timestamp) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`, "utf8").digest();
  return signatures.some((signature) => {
    if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
    const received = Buffer.from(signature, "hex");
    return received.length === expected.length && timingSafeEqual(received, expected);
  });
}

function normalizeState(value: unknown): SubscriptionState {
  if (value === "active" || value === "trialing" || value === "past_due" || value === "canceled") return value;
  return "inactive";
}

export async function getBillingStatus(uid: string): Promise<BillingStatus> {
  const snapshot = await getServerFirestore().collection("users").doc(uid).get();
  const data = snapshot.data()?.billing as Partial<BillingStatus> | undefined;
  return {
    plan: data?.plan === "pro" ? "pro" : "free",
    status: normalizeState(data?.status),
    stripeCustomerId: typeof data?.stripeCustomerId === "string" ? data.stripeCustomerId : undefined,
    stripeSubscriptionId: typeof data?.stripeSubscriptionId === "string" ? data.stripeSubscriptionId : undefined,
    currentPeriodEnd: typeof data?.currentPeriodEnd === "string" ? data.currentPeriodEnd : undefined,
  };
}

export async function isProUser(uid: string) {
  const billing = await getBillingStatus(uid);
  return billing.plan === "pro" && ["active", "trialing"].includes(billing.status);
}

function objectText(object: Record<string, unknown>, key: string) {
  const value = object[key];
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value && typeof value.id === "string") return value.id;
  return undefined;
}

function metadataUid(object: Record<string, unknown>) {
  const metadata = object.metadata;
  if (!metadata || typeof metadata !== "object") return undefined;
  const uid = (metadata as Record<string, unknown>).firebaseUid;
  return typeof uid === "string" && uid ? uid : undefined;
}

function eventBilling(event: StripeEvent): { uid: string; billing: BillingStatus } | null {
  const object = event.data.object;
  if (event.type === "checkout.session.completed") {
    const uid = objectText(object, "client_reference_id") || metadataUid(object);
    if (!uid) return null;
    const paymentStatus = objectText(object, "payment_status");
    const active = paymentStatus === "paid" || paymentStatus === "no_payment_required";
    return {
      uid,
      billing: {
        plan: active ? "pro" : "free",
        status: active ? "active" : "inactive",
        stripeCustomerId: objectText(object, "customer"),
        stripeSubscriptionId: objectText(object, "subscription"),
      },
    };
  }
  if (!["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"].includes(event.type)) return null;
  const uid = metadataUid(object);
  if (!uid) return null;
  const state = event.type === "customer.subscription.deleted" ? "canceled" : normalizeState(object.status);
  const plan: SubscriptionPlan = state === "active" || state === "trialing" ? "pro" : "free";
  const periodEnd = Number(object.current_period_end);
  return {
    uid,
    billing: {
      plan,
      status: state,
      stripeCustomerId: objectText(object, "customer"),
      stripeSubscriptionId: objectText(object, "id"),
      currentPeriodEnd: Number.isFinite(periodEnd) ? new Date(periodEnd * 1_000).toISOString() : undefined,
    },
  };
}

export async function applyStripeEvent(event: StripeEvent) {
  const db = getServerFirestore();
  const eventRef = db.collection("billingEvents").doc(event.id);
  const update = eventBilling(event);
  let entitlementUpdated = false;

  await db.runTransaction(async (transaction) => {
    entitlementUpdated = false;
    if ((await transaction.get(eventRef)).exists) return;
    if (update) {
      const userRef = db.collection("users").doc(update.uid);
      const userSnapshot = await transaction.get(userRef);
      const existingBilling = userSnapshot.data()?.billing as Record<string, unknown> | undefined;
      const previousCreated = Number(existingBilling?.stripeEventCreated);
      const previousType = typeof existingBilling?.stripeEventType === "string" ? existingBilling.stripeEventType : "";
      const isOlder = Number.isFinite(previousCreated) && event.created < previousCreated;
      const isCheckoutBehindSubscription = event.created === previousCreated
        && event.type === "checkout.session.completed"
        && previousType.startsWith("customer.subscription.");

      if (!isOlder && !isCheckoutBehindSubscription) {
        transaction.set(userRef, {
          billing: {
            ...update.billing,
            stripeEventCreated: event.created,
            stripeEventType: event.type,
          },
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
        entitlementUpdated = true;
      }
    }
    transaction.set(eventRef, {
      type: event.type,
      stripeCreatedAt: new Date(event.created * 1_000).toISOString(),
      processedAt: FieldValue.serverTimestamp(),
      uid: update?.uid || null,
      entitlementUpdated,
    });
  });

  return { processed: true, entitlementUpdated, uid: update?.uid };
}
