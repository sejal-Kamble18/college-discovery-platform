import assert from "node:assert/strict";
import test from "node:test";
import { predictColleges } from "@/lib/predictor/engine";

test("prediction output is deterministic", () => {
  const first = predictColleges("JEE Advanced", "general", 400);
  const second = predictColleges("JEE Advanced", "general", 400);
  assert.deepEqual(first, second);
});

test("rank mode treats a lower rank as eligible", () => {
  const response = predictColleges("JEE Advanced", "general", 400);
  const iitBombay = response.results.find((result) => result.college.id === "iit-bombay");
  assert.equal(iitBombay?.cutoff, 450);
  assert.equal(iitBombay?.eligible, true);
});

test("rank mode labels a rank beyond the stored cutoff as reach", () => {
  const response = predictColleges("JEE Advanced", "general", 500);
  const iitBombay = response.results.find((result) => result.college.id === "iit-bombay");
  assert.equal(iitBombay?.eligible, false);
  assert.equal(iitBombay?.chance, "reach");
});
