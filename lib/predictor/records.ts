import { SEED_COLLEGES } from "@/lib/data/colleges.seed";
import type {
  CutoffRecord,
  PredictionDataSource,
  ReservationCategory,
  ScoreMode,
  SupportedExam,
} from "@/types";

interface FirestoreValue {
  nullValue?: null;
  booleanValue?: boolean;
  integerValue?: string;
  doubleValue?: number;
  timestampValue?: string;
  stringValue?: string;
  arrayValue?: { values?: FirestoreValue[] };
  mapValue?: { fields?: Record<string, FirestoreValue> };
}

interface FirestoreDocument {
  name: string;
  fields?: Record<string, FirestoreValue>;
}

const CATEGORIES: ReservationCategory[] = ["general", "obc", "sc", "st", "ews"];
const EXAM_MODES: Record<SupportedExam, ScoreMode> = {
  "JEE Advanced": "rank",
  "JEE Main": "percentile",
  NEET: "score",
  CAT: "percentile",
  BITSAT: "score",
};

function isSupportedExam(value: string): value is SupportedExam {
  return value in EXAM_MODES;
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function buildSeedCutoffRecords(): CutoffRecord[] {
  const records: CutoffRecord[] = [];

  for (const college of SEED_COLLEGES) {
    for (const [examName, cutoff] of Object.entries(college.cutoffs)) {
      if (!isSupportedExam(examName)) continue;
      for (const category of CATEGORIES) {
        const value = cutoff[category];
        if (!Number.isFinite(value)) continue;
        records.push({
          id: `${college.id}-${slug(examName)}-${category}-${cutoff.year}`,
          collegeId: college.id,
          collegeSlug: college.slug,
          collegeName: college.name,
          shortName: college.shortName,
          city: college.location.city,
          state: college.location.state,
          exam: examName,
          category,
          mode: EXAM_MODES[examName],
          cutoff: value,
          year: cutoff.year,
          courseName: "Institution-level reference",
          quota: "Not specified",
          sourceAuthority: "EduDiscover reference seed",
          datasetVersion: `reference-${cutoff.year}`,
          isVerified: false,
        });
      }
    }
  }

  return records;
}

function decodeValue(value: FirestoreValue): unknown {
  if ("nullValue" in value) return null;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("stringValue" in value) return value.stringValue;
  if (value.arrayValue) return (value.arrayValue.values || []).map(decodeValue);
  if (value.mapValue) return decodeFields(value.mapValue.fields || {});
  return undefined;
}

function decodeFields(fields: Record<string, FirestoreValue>) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]));
}

function readText(data: Record<string, unknown>, key: string) {
  const value = data[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeCutoffRecord(document: FirestoreDocument): CutoffRecord | null {
  const data = decodeFields(document.fields || {});
  const id = readText(data, "id") || document.name.split("/").pop();
  const exam = readText(data, "exam");
  const category = readText(data, "category");
  const mode = readText(data, "mode");
  const cutoff = Number(data.cutoff);
  const year = Number(data.year);

  if (
    !id || !exam || !isSupportedExam(exam) ||
    !category || !CATEGORIES.includes(category as ReservationCategory) ||
    !mode || !["rank", "score", "percentile"].includes(mode) ||
    !Number.isFinite(cutoff) || !Number.isInteger(year)
  ) return null;

  const collegeId = readText(data, "collegeId");
  const collegeName = readText(data, "collegeName");
  const shortName = readText(data, "shortName");
  const city = readText(data, "city");
  const state = readText(data, "state");
  const datasetVersion = readText(data, "datasetVersion");
  if (!collegeId || !collegeName || !shortName || !city || !state || !datasetVersion) return null;

  return {
    id,
    collegeId,
    collegeSlug: readText(data, "collegeSlug"),
    collegeName,
    shortName,
    city,
    state,
    exam,
    category: category as ReservationCategory,
    mode: mode as ScoreMode,
    cutoff,
    year,
    courseName: readText(data, "courseName"),
    round: readText(data, "round"),
    quota: readText(data, "quota"),
    sourceAuthority: readText(data, "sourceAuthority"),
    sourceUrl: readText(data, "sourceUrl"),
    datasetVersion,
    isVerified: data.isVerified === true,
  };
}

function firebaseRestConfig() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  return projectId && apiKey ? { projectId, apiKey } : null;
}

async function fetchFirestoreCutoffs(exam: SupportedExam, category: ReservationCategory) {
  const config = firebaseRestConfig();
  if (!config) return [];
  const configuredLimit = Number(process.env.PREDICTOR_QUERY_LIMIT || 500);
  const limit = Number.isFinite(configuredLimit) ? Math.max(1, Math.min(configuredLimit, 2_000)) : 500;
  const url = new URL(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(config.projectId)}/databases/(default)/documents:runQuery`);
  url.searchParams.set("key", config.apiKey);

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "cutoffRecords" }],
        where: {
          compositeFilter: {
            op: "AND",
            filters: [
              { fieldFilter: { field: { fieldPath: "exam" }, op: "EQUAL", value: { stringValue: exam } } },
              { fieldFilter: { field: { fieldPath: "category" }, op: "EQUAL", value: { stringValue: category } } },
            ],
          },
        },
        orderBy: [{ field: { fieldPath: "year" }, direction: "DESCENDING" }],
        limit,
      },
    }),
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) throw new Error(`Firestore cutoff query returned ${response.status}.`);
  const rows = (await response.json()) as Array<{ document?: FirestoreDocument }>;
  return rows.flatMap((row) => {
    if (!row.document) return [];
    const record = normalizeCutoffRecord(row.document);
    return record ? [record] : [];
  });
}

export async function loadCutoffRecords(
  exam: SupportedExam,
  category: ReservationCategory,
): Promise<{ records: CutoffRecord[]; dataSource: PredictionDataSource }> {
  try {
    const records = await fetchFirestoreCutoffs(exam, category);
    if (records.length > 0) return { records, dataSource: "firestore" };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.warn("Using reference cutoff data:", error);
  }

  return {
    records: buildSeedCutoffRecords().filter((record) => record.exam === exam && record.category === category),
    dataSource: "reference-seed",
  };
}
