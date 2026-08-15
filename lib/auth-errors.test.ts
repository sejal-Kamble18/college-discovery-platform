import assert from "node:assert/strict";
import test from "node:test";
import { formatAuthError, getFirebaseAuthErrorCode } from "@/lib/auth-errors";

test("extracts a Firebase auth code from structured errors", () => {
  assert.equal(getFirebaseAuthErrorCode({ code: "auth/popup-blocked" }), "auth/popup-blocked");
});

test("extracts a Firebase auth code from an error message", () => {
  assert.equal(
    getFirebaseAuthErrorCode(new Error("Firebase: Error (auth/invalid-api-key).")),
    "auth/invalid-api-key",
  );
});

test("includes the current host for unauthorized-domain guidance", () => {
  assert.match(
    formatAuthError({ code: "auth/unauthorized-domain" }, "staging.example.com"),
    /staging\.example\.com/,
  );
});

test("does not expose unknown provider messages to users", () => {
  assert.equal(
    formatAuthError(new Error("internal provider details")),
    "We couldn't complete sign-in. Please try again. If it continues, contact the site administrator.",
  );
});
