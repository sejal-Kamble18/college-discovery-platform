import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { verifyStripeSignature } from "@/lib/server/billing";

test("accepts a current valid Stripe webhook signature", () => {
  const payload = JSON.stringify({ id: "evt_test" });
  const secret = "whsec_test";
  const timestamp = 1_800_000_000;
  const signature = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  assert.equal(verifyStripeSignature(payload, `t=${timestamp},v1=${signature}`, secret, timestamp + 10), true);
});

test("rejects expired or modified Stripe webhook signatures", () => {
  const payload = JSON.stringify({ id: "evt_test" });
  const secret = "whsec_test";
  const timestamp = 1_800_000_000;
  const signature = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  assert.equal(verifyStripeSignature(`${payload}changed`, `t=${timestamp},v1=${signature}`, secret, timestamp + 10), false);
  assert.equal(verifyStripeSignature(payload, `t=${timestamp},v1=${signature}`, secret, timestamp + 301), false);
});
