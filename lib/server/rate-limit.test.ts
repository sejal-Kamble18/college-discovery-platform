import assert from "node:assert/strict";
import test from "node:test";
import { checkRateLimit } from "@/lib/server/rate-limit";

test("rate limiter rejects requests above the per-window limit", () => {
  const key = `test-${Date.now()}-${process.pid}`;
  assert.equal(checkRateLimit(key, 2).allowed, true);
  assert.equal(checkRateLimit(key, 2).allowed, true);
  const blocked = checkRateLimit(key, 2);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfter > 0);
});
