import { NextResponse } from "next/server";
import { applyStripeEvent, type StripeEvent, verifyStripeSignature } from "@/lib/server/billing";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature") || "";
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret || !verifyStripeSignature(payload, signature, secret)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(payload) as StripeEvent;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }
  if (!event.id || !event.type || !event.data?.object || !Number.isFinite(event.created)) {
    return NextResponse.json({ error: "Incomplete webhook event." }, { status: 400 });
  }

  try {
    const result = await applyStripeEvent(event);
    return NextResponse.json({ received: true, ...result });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("Webhook processing failed:", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
