import admin from "firebase-admin";
import { readFile } from "fs/promises";
import path from "path";
import { INDIAN_STATES } from "../constants/filters";

type InputRow = Record<string, unknown>;

interface DirectoryRecord {
  id: string;
  aisheCode?: string;
  name: string;
  state: string;
  district?: string;
  city?: string;
  type?: string;
  management?: string;
  website?: string;
  sourceUrl: string;
  sourceAuthority: string;
  sourceYear: number;
  searchTokens: string[];
  isDirectoryVerified: true;
}

const serviceAccountPath = path.join(process.cwd(), "serviceAccountKey.json");
const dataPath = process.env.DIRECTORY_DATA_PATH
  ? path.resolve(process.env.DIRECTORY_DATA_PATH)
  : path.join(process.cwd(), "scripts", "data", "college-directory.csv");

function parseCsv(input: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === '"') {
      if (quoted && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if (character === "\n" && !quoted) {
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = "";
    } else if (character !== "\r" || quoted) {
      field += character;
    }
  }
  row.push(field);
  if (row.some((value) => value.trim())) rows.push(row);
  if (rows.length === 0) return [];

  const headers = rows[0].map((header) => header.replace(/^\uFEFF/, "").trim());
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() || ""])));
}

function value(row: InputRow, ...keys: string[]) {
  for (const key of keys) {
    const candidate = row[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    if (typeof candidate === "number" && Number.isFinite(candidate)) return String(candidate);
  }
  return undefined;
}

function validateUrl(raw: string, field: string) {
  const url = new URL(raw);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error(`${field} must use HTTP or HTTPS.`);
  return raw;
}

function recordId(valueToSlug: string) {
  return valueToSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 140);
}

function searchTokens(...values: Array<string | undefined>) {
  const words = values.join(" ").toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length >= 2);
  const tokens = new Set<string>();
  for (const word of words) {
    tokens.add(word);
    for (let length = 2; length <= Math.min(word.length - 1, 18); length += 1) tokens.add(word.slice(0, length));
    if (tokens.size >= 300) break;
  }
  return [...tokens];
}

function normalizeRow(row: InputRow, index: number): DirectoryRecord {
  const name = value(row, "name", "institutionName", "collegeName", "universityName");
  const rawState = value(row, "state", "stateName");
  if (!name || !rawState) throw new Error(`Directory row ${index + 1} requires name and state.`);
  const state = INDIAN_STATES.find((item) => item.toLowerCase() === rawState.toLowerCase());
  if (!state) throw new Error(`Directory row ${index + 1} has an unsupported state/UT: ${rawState}`);

  const aisheCode = value(row, "aisheCode", "aishe_code", "institutionCode");
  const district = value(row, "district", "districtName");
  const city = value(row, "city", "town") || district;
  const type = value(row, "type", "institutionType");
  const management = value(row, "management", "managementType");
  const websiteValue = value(row, "website", "officialWebsite");
  const sourceUrl = validateUrl(value(row, "sourceUrl") || process.env.DIRECTORY_SOURCE_URL || "", "sourceUrl");
  const sourceAuthority = value(row, "sourceAuthority") || process.env.DIRECTORY_SOURCE_AUTHORITY || "AISHE";
  const sourceYear = Number(value(row, "sourceYear") || process.env.DIRECTORY_SOURCE_YEAR);
  if (!Number.isInteger(sourceYear) || sourceYear < 2000 || sourceYear > new Date().getFullYear() + 1) {
    throw new Error(`Directory row ${index + 1} requires a valid sourceYear.`);
  }
  const id = recordId(value(row, "id") || aisheCode || `${name}-${state}`);
  if (!id) throw new Error(`Directory row ${index + 1} cannot produce a document id.`);

  return {
    id,
    aisheCode,
    name,
    state,
    district,
    city,
    type,
    management,
    website: websiteValue ? validateUrl(websiteValue, "website") : undefined,
    sourceUrl,
    sourceAuthority,
    sourceYear,
    searchTokens: searchTokens(name, city, district, state, aisheCode, type, management),
    isDirectoryVerified: true,
  };
}

async function readRows() {
  const raw = await readFile(dataPath, "utf-8");
  if (path.extname(dataPath).toLowerCase() === ".json") {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) throw new Error("Directory JSON must be an array.");
    return parsed as InputRow[];
  }
  return parseCsv(raw) as InputRow[];
}

async function main() {
  if (process.env.CONFIRM_DIRECTORY_IMPORT !== "verified") {
    throw new Error("Import stopped. Verify the official directory source, then run with CONFIRM_DIRECTORY_IMPORT=verified.");
  }

  const serviceAccount = JSON.parse(await readFile(serviceAccountPath, "utf-8"));
  const rows = await readRows();
  const records = rows.map(normalizeRow);
  const ids = new Set<string>();
  for (const record of records) {
    if (ids.has(record.id)) throw new Error(`Duplicate directory id: ${record.id}`);
    ids.add(record.id);
  }

  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const db = admin.firestore();
  console.log(`Importing ${records.length} verified directory records from ${dataPath}...`);
  let batch = db.batch();
  let pending = 0;
  let count = 0;

  for (const record of records) {
    batch.set(db.collection("collegeDirectory").doc(record.id), {
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
  console.log(`Done. Imported ${count} directory records.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
