import admin from "firebase-admin";
import { readFile } from "fs/promises";
import path from "path";
import type { CutoffRecord, ReservationCategory, ScoreMode, SupportedExam } from "../types";

const serviceAccountPath = path.join(process.cwd(), "serviceAccountKey.json");
const dataPath = process.env.CUTOFF_DATA_PATH
  ? path.resolve(process.env.CUTOFF_DATA_PATH)
  : path.join(process.cwd(), "scripts", "data", "cutoff-records.json");
const categories: ReservationCategory[] = ["general", "obc", "sc", "st", "ews"];
const examModes: Record<SupportedExam, ScoreMode> = {
  "JEE Advanced": "rank",
  "JEE Main": "percentile",
  NEET: "score",
  CAT: "percentile",
  BITSAT: "score",
};

function requiredText(record: Record<string, unknown>, field: string) {
  const value = record[field];
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} must be a non-empty string.`);
  return value.trim();
}

function optionalText(record: Record<string, unknown>, field: string) {
  const value = record[field];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function validateUrl(value: string, field: string) {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error(`${field} must use HTTP or HTTPS.`);
  return value;
}

function validateRecord(input: unknown, index: number): CutoffRecord {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error(`Record ${index + 1} is not an object.`);
  const data = input as Record<string, unknown>;
  const exam = requiredText(data, "exam") as SupportedExam;
  const category = requiredText(data, "category") as ReservationCategory;
  const mode = requiredText(data, "mode") as ScoreMode;
  const cutoff = Number(data.cutoff);
  const year = Number(data.year);
  const sourceUrl = validateUrl(requiredText(data, "sourceUrl"), "sourceUrl");

  if (!(exam in examModes)) throw new Error(`Record ${index + 1} has an unsupported exam.`);
  if (!categories.includes(category)) throw new Error(`Record ${index + 1} has an unsupported category.`);
  if (mode !== examModes[exam]) throw new Error(`Record ${index + 1} uses the wrong score mode for ${exam}.`);
  if (!Number.isFinite(cutoff) || cutoff < 0) throw new Error(`Record ${index + 1} has an invalid cutoff.`);
  if (!Number.isInteger(year) || year < 2000 || year > new Date().getFullYear() + 1) throw new Error(`Record ${index + 1} has an invalid year.`);
  if (data.isVerified !== true) throw new Error(`Record ${index + 1} must be source-verified before import.`);

  return {
    id: requiredText(data, "id"),
    collegeId: requiredText(data, "collegeId"),
    collegeSlug: optionalText(data, "collegeSlug"),
    collegeName: requiredText(data, "collegeName"),
    shortName: requiredText(data, "shortName"),
    city: requiredText(data, "city"),
    state: requiredText(data, "state"),
    exam,
    category,
    mode,
    cutoff,
    year,
    courseName: optionalText(data, "courseName"),
    round: optionalText(data, "round"),
    quota: optionalText(data, "quota"),
    sourceAuthority: requiredText(data, "sourceAuthority"),
    sourceUrl,
    datasetVersion: requiredText(data, "datasetVersion"),
    isVerified: true,
  };
}

async function main() {
  if (process.env.CONFIRM_CUTOFF_IMPORT !== "verified") {
    throw new Error("Import stopped. Audit every source row, then run with CONFIRM_CUTOFF_IMPORT=verified.");
  }

  const serviceAccount = JSON.parse(await readFile(serviceAccountPath, "utf-8"));
  const input = JSON.parse(await readFile(dataPath, "utf-8")) as unknown;
  if (!Array.isArray(input)) throw new Error("Cutoff dataset must be a JSON array.");
  const records = input.map(validateRecord);
  const ids = new Set<string>();
  for (const record of records) {
    if (record.id.includes("/")) throw new Error(`Cutoff record id cannot contain '/': ${record.id}`);
    if (ids.has(record.id)) throw new Error(`Duplicate cutoff record id: ${record.id}`);
    ids.add(record.id);
  }

  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const db = admin.firestore();
  console.log(`Importing ${records.length} verified cutoff records from ${dataPath}...`);

  let batch = db.batch();
  let pending = 0;
  let count = 0;
  for (const record of records) {
    batch.set(db.collection("cutoffRecords").doc(record.id), {
      ...record,
      importedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    pending += 1;
    count += 1;
    if (pending === 400) {
      await batch.commit();
      console.log(`Imported ${count}`);
      batch = db.batch();
      pending = 0;
    }
  }
  if (pending > 0) await batch.commit();
  console.log(`Done. Imported ${count} verified cutoff records.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
