import { NextResponse } from "next/server";
import { BillingError, getApplicationUrl, getBillingStatus, stripePost } from "@/lib/server/billing";
import { requireServerUser, ServerAuthError } from "@/lib/server/firebase-admin";
import { checkRateLimit } from "@/lib/server/rate-limit";

function errorResponse(error: unknown) {
  if (error instanceof ServerAuthError || error instanceof BillingError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (process.env.NODE_ENV !== "production") console.error("Checkout failed:", error);
  return NextResponse.json({ error: "Secure checkout is temporarily unavailable." }, { status: 503 });
}

export async function POST(request: Request) {
  const clientAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "local";
  const rate = checkRateLimit(`billing-checkout:${clientAddress}`, 5, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many checkout requests. Try again shortly." }, {
      status: 429,
      headers: { "Retry-After": String(rate.retryAfter) },
    });
  }

  try {
    const user = await requireServerUser(request);
    const billing = await getBillingStatus(user.uid);
    if (billing.plan === "pro" && ["active", "trialing"].includes(billing.status)) {
      throw new BillingError("Your Pro subscription is already active. Use Manage billing instead.", 409);
    }
    const priceId = process.env.STRIPE_PRO_PRICE_ID?.trim();
    if (!priceId?.startsWith("price_")) throw new BillingError("STRIPE_PRO_PRICE_ID is not configured.", 503);
    const appUrl = getApplicationUrl(request);
    const parameters = new URLSearchParams({
      mode: "subscription",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      success_url: `${appUrl}/pricing?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=canceled`,
      client_reference_id: user.uid,
      "metadata[firebaseUid]": user.uid,
      "subscription_data[metadata][firebaseUid]": user.uid,
      allow_promotion_codes: "true",
    });
    if (billing.stripeCustomerId) parameters.set("customer", billing.stripeCustomerId);
    else if (user.email) parameters.set("customer_email", user.email);

    const session = await stripePost(
      "checkout/sessions",
      parameters,
      `checkout-${user.uid}-${priceId}-${Math.floor(Date.now() / 60_000)}`,
    );
    if (!session.url) throw new BillingError("Stripe did not return a checkout URL.", 503);
    return NextResponse.json({ url: session.url }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return errorResponse(error);
  }
}
