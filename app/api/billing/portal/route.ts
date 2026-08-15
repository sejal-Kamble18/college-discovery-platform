import { NextResponse } from "next/server";
import { BillingError, getApplicationUrl, getBillingStatus, stripePost } from "@/lib/server/billing";
import { requireServerUser, ServerAuthError } from "@/lib/server/firebase-admin";
import { checkRateLimit } from "@/lib/server/rate-limit";

function errorResponse(error: unknown) {
  if (error instanceof ServerAuthError || error instanceof BillingError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (process.env.NODE_ENV !== "production") console.error("Billing portal failed:", error);
  return NextResponse.json({ error: "Billing management is temporarily unavailable." }, { status: 503 });
}

export async function POST(request: Request) {
  const clientAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "local";
  const rate = checkRateLimit(`billing-portal:${clientAddress}`, 10, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many billing requests. Try again shortly." }, {
      status: 429,
      headers: { "Retry-After": String(rate.retryAfter) },
    });
  }

  try {
    const user = await requireServerUser(request);
    const billing = await getBillingStatus(user.uid);
    if (!billing.stripeCustomerId) throw new BillingError("No Stripe customer is linked to this account yet.", 409);
    const returnUrl = `${getApplicationUrl(request)}/pricing`;
    const session = await stripePost("billing_portal/sessions", new URLSearchParams({
      customer: billing.stripeCustomerId,
      return_url: returnUrl,
    }));
    if (!session.url) throw new BillingError("Stripe did not return a billing portal URL.", 503);
    return NextResponse.json({ url: session.url }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}
