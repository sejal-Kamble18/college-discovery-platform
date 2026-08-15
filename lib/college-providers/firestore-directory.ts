import type { ExternalCollege } from "@/types";

interface FirestoreValue {
  nullValue?: null;
  booleanValue?: boolean;
  integerValue?: string;
  doubleValue?: number;
  stringValue?: string;
  arrayValue?: { values?: FirestoreValue[] };
  mapValue?: { fields?: Record<string, FirestoreValue> };
}

interface FirestoreDocument {
  name: string;
  fields?: Record<string, FirestoreValue>;
}

const STOP_WORDS = new Set(["and", "college", "in", "india", "institute", "institution", "of", "the", "university"]);

function decodeValue(value: FirestoreValue): unknown {
  if ("nullValue" in value) return null;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("stringValue" in value) return value.stringValue;
  if (value.arrayValue) return (value.arrayValue.values || []).map(decodeValue);
  if (value.mapValue) return decodeFields(value.mapValue.fields || {});
  return undefined;
}

function decodeFields(fields: Record<string, FirestoreValue>) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]));
}

function queryTokens(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));
}

function asText(data: Record<string, unknown>, key: string) {
  const value = data[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeResult(document: FirestoreDocument): ExternalCollege | null {
  const data = decodeFields(document.fields || {});
  const id = document.name.split("/").pop();
  const name = asText(data, "name");
  const state = asText(data, "state");
  if (!id || !name || !state) return null;
  const city = asText(data, "city");
  const district = asText(data, "district");
  const aisheCode = asText(data, "aisheCode");
  const sourceAuthority = asText(data, "sourceAuthority") || "AISHE";
  const sourceYear = Number(data.sourceYear);
  const website = asText(data, "website") || asText(data, "sourceUrl");

  return {
    source: "aishe-firestore",
    externalId: `aishe-${id}`,
    name,
    formattedAddress: [city, district && district !== city ? district : undefined, state, "India"].filter(Boolean).join(", "),
    city,
    state,
    country: "India",
    website,
    description: [
      aisheCode ? `AISHE code ${aisheCode}.` : undefined,
      `${sourceAuthority}${Number.isInteger(sourceYear) ? ` directory ${sourceYear}` : " directory"}.`,
      "Directory identity only; confirm courses and admissions on the official institution website.",
    ].filter(Boolean).join(" "),
  };
}

function firebaseRestConfig() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  return projectId && apiKey ? { projectId, apiKey } : null;
}

export async function searchFirestoreDirectory(query: string, state?: string): Promise<ExternalCollege[]> {
  const config = firebaseRestConfig();
  if (!config) return [];
  const tokens = queryTokens(query);
  const lookupToken = [...tokens].sort((a, b) => b.length - a.length)[0];
  if (!lookupToken && !state) return [];

  const filters: Record<string, unknown>[] = [];
  if (lookupToken) {
    filters.push({
      fieldFilter: {
        field: { fieldPath: "searchTokens" },
        op: "ARRAY_CONTAINS",
        value: { stringValue: lookupToken },
      },
    });
  }
  if (state) {
    filters.push({
      fieldFilter: {
        field: { fieldPath: "state" },
        op: "EQUAL",
        value: { stringValue: state },
      },
    });
  }

  const where = filters.length === 1 ? filters[0] : { compositeFilter: { op: "AND", filters } };
  const url = new URL(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(config.projectId)}/databases/(default)/documents:runQuery`);
  url.searchParams.set("key", config.apiKey);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "collegeDirectory" }],
          where,
          limit: 100,
        },
      }),
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`Firestore directory query returned ${response.status}.`);
    const rows = (await response.json()) as Array<{ document?: FirestoreDocument }>;
    const results = rows.flatMap((row) => row.document ? [normalizeResult(row.document)] : []).filter((item): item is ExternalCollege => item !== null);
    const filtered = tokens.length > 0
      ? results.filter((college) => {
          const text = `${college.name} ${college.formattedAddress}`.toLowerCase();
          return tokens.every((token) => text.includes(token));
        })
      : results;
    return filtered.slice(0, 30);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.warn("AISHE Firestore directory is unavailable:", error);
    return [];
  }
}
