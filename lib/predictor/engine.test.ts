import assert from "node:assert/strict";
import test from "node:test";
import { evaluateCutoffRecords } from "@/lib/predictor/engine";
import { buildSeedCutoffRecords } from "@/lib/predictor/records";
import type { CutoffRecord, PredictionRequest } from "@/types";

const records = buildSeedCutoffRecords();
const request: PredictionRequest = {
  exam: "JEE Advanced",
  category: "general",
  value: 400,
};

test("prediction output is deterministic", () => {
  const first = evaluateCutoffRecords(records, request, "reference-seed");
  const second = evaluateCutoffRecords(records, request, "reference-seed");
  assert.deepEqual(first, second);
});

test("rank mode treats a lower rank as eligible", () => {
  const response = evaluateCutoffRecords(records, request, "reference-seed");
  const iitBombay = response.results.find((result) => result.college.id === "iit-bombay");
  assert.equal(iitBombay?.cutoff, 450);
  assert.equal(iitBombay?.eligible, true);
  assert.equal(iitBombay?.band, "likely");
});

test("rank mode labels a rank beyond the stored cutoff as reach", () => {
  const response = evaluateCutoffRecords(records, { ...request, value: 500 }, "reference-seed");
  const iitBombay = response.results.find((result) => result.college.id === "iit-bombay");
  assert.equal(iitBombay?.eligible, false);
  assert.equal(iitBombay?.band, "reach");
});

test("uses only the newest comparable cutoff unless a year is requested", () => {
  const base: CutoffRecord = {
    id: "new",
    collegeId: "college",
    collegeSlug: "college",
    collegeName: "Example College",
    shortName: "EC",
    city: "Pune",
    state: "Maharashtra",
    exam: "JEE Main",
    category: "general",
    mode: "percentile",
    cutoff: 95,
    year: 2025,
    courseName: "Computer Science",
    quota: "All India",
    datasetVersion: "josaa-2025",
    sourceUrl: "https://example.edu/cutoffs",
    isVerified: true,
  };
  const old = { ...base, id: "old", cutoff: 93, year: 2024, datasetVersion: "josaa-2024" };
  const latest = evaluateCutoffRecords([old, base], { exam: "JEE Main", category: "general", value: 96 }, "firestore");
  const historical = evaluateCutoffRecords([old, base], { exam: "JEE Main", category: "general", value: 96, year: 2024 }, "firestore");

  assert.equal(latest.total, 1);
  assert.equal(latest.results[0]?.cutoffYear, 2025);
  assert.equal(historical.results[0]?.cutoffYear, 2024);
  assert.equal(latest.results[0]?.evidenceQuality, "verified-source");
});

test("paginates filtered prediction records", () => {
  const response = evaluateCutoffRecords(records, { ...request, page: 2, pageSize: 3 }, "reference-seed");
  assert.equal(response.page, 2);
  assert.equal(response.pageSize, 3);
  assert.ok(response.results.length <= 3);
  assert.ok(response.totalPages >= 2);
});
