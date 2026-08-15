import { SEED_COLLEGES } from "@/lib/data/colleges.seed";
import { INDIAN_STATES } from "@/constants/filters";
import type { College, CollegeListItem, SortField, SortOrder } from "@/types";
import { ITEMS_PER_PAGE } from "@/types/filters";

export interface GetCollegesParams {
  query?: string;
  state?: string;
  type?: string;
  category?: string;
  exam?: string;
  maxFees?: number;
  minRating?: number;
  sortBy?: SortField;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export interface GetCollegesResult {
  colleges: CollegeListItem[];
  total: number;
  page: number;
  totalPages: number;
}

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

function normalizeCollege(docId: string, data: Record<string, unknown>): College {
  return { ...data, id: String(data.id || docId), slug: String(data.slug || docId) } as College;
}

function toListItem(college: College): CollegeListItem {
  const { id, slug, name, shortName, type, category, location, ranking, fees, rating, reviewCount, exams, accreditation, established, isVerified } = college;
  return { id, slug, name, shortName, type, category, location, ranking, fees, rating, reviewCount, exams, accreditation, established, isVerified };
}

function firebaseRestConfig() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  return projectId && apiKey ? { projectId, apiKey } : null;
}

async function fetchFirestoreColleges(max: number): Promise<College[]> {
  const config = firebaseRestConfig();
  if (!config) return SEED_COLLEGES;

  const safeMax = Math.max(1, Math.min(max, Number(process.env.COLLEGE_QUERY_SCAN_LIMIT || 250)));
  const url = new URL(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(config.projectId)}/databases/(default)/documents/colleges`);
  url.searchParams.set("pageSize", String(safeMax));
  url.searchParams.set("key", config.apiKey);

  try {
    const response = await fetch(url, { next: { revalidate: 300 }, signal: AbortSignal.timeout(8_000) });
    if (!response.ok) throw new Error(`Firestore directory returned ${response.status}.`);
    const body = (await response.json()) as { documents?: FirestoreDocument[] };
    const colleges = (body.documents || []).map((document) => {
      const docId = document.name.split("/").pop() || "college";
      return normalizeCollege(docId, decodeFields(document.fields || {}));
    });
    return colleges.length > 0 ? colleges : SEED_COLLEGES;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.warn("Using reference college data:", error);
    return SEED_COLLEGES;
  }
}

function compareColleges(a: College, b: College, sortBy: SortField, sortOrder: SortOrder) {
  let aValue: number | string;
  let bValue: number | string;
  if (sortBy === "fees") {
    aValue = a.fees?.tuitionPerYear ?? Number.MAX_SAFE_INTEGER;
    bValue = b.fees?.tuitionPerYear ?? Number.MAX_SAFE_INTEGER;
  } else if (sortBy === "rating") {
    aValue = a.rating ?? 0;
    bValue = b.rating ?? 0;
  } else if (sortBy === "name") {
    aValue = a.name || "";
    bValue = b.name || "";
  } else if (sortBy === "established") {
    aValue = a.established ?? Number.MAX_SAFE_INTEGER;
    bValue = b.established ?? Number.MAX_SAFE_INTEGER;
  } else {
    aValue = a.ranking?.nirf ?? Number.MAX_SAFE_INTEGER;
    bValue = b.ranking?.nirf ?? Number.MAX_SAFE_INTEGER;
  }
  const comparison = typeof aValue === "string" && typeof bValue === "string" ? aValue.localeCompare(bValue) : Number(aValue) - Number(bValue);
  return sortOrder === "desc" ? -comparison : comparison;
}

export async function getColleges(params: GetCollegesParams = {}): Promise<GetCollegesResult> {
  const { query = "", state = "", type = "", category = "", exam = "", maxFees, minRating, sortBy = "ranking", sortOrder = "asc", page = 1 } = params;
  const pageSize = Math.max(1, Math.min(params.limit || ITEMS_PER_PAGE, 60));
  let pool = await fetchFirestoreColleges(Number(process.env.COLLEGE_QUERY_SCAN_LIMIT || 250));
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery) {
    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    pool = pool.filter((college) => {
      const searchable = [college.name, college.shortName, college.location?.city, college.location?.state, ...(college.searchTokens || []), ...(college.exams || []), ...(college.courses || []).map((course) => course.name)]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");
      return tokens.every((token) => searchable.includes(token));
    });
  }
  if (state) pool = pool.filter((college) => college.location?.state === state);
  if (type) pool = pool.filter((college) => college.type === type);
  if (category) pool = pool.filter((college) => college.category === category);
  if (exam) pool = pool.filter((college) => college.exams?.includes(exam));
  if (maxFees !== undefined && maxFees > 0) pool = pool.filter((college) => (college.fees?.tuitionPerYear || 0) <= maxFees);
  if (minRating !== undefined && minRating > 0) pool = pool.filter((college) => (college.rating || 0) >= minRating);

  pool.sort((a, b) => compareColleges(a, b, sortBy, sortOrder));
  const total = pool.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const offset = (safePage - 1) * pageSize;
  return { colleges: pool.slice(offset, offset + pageSize).map(toListItem), total, page: safePage, totalPages };
}

export async function getCollegeBySlug(slug: string): Promise<College | null> {
  const config = firebaseRestConfig();
  if (config) {
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(config.projectId)}/databases/(default)/documents/colleges/${encodeURIComponent(slug)}?key=${encodeURIComponent(config.apiKey)}`;
    try {
      const response = await fetch(url, { next: { revalidate: 300 }, signal: AbortSignal.timeout(8_000) });
      if (response.ok) {
        const document = (await response.json()) as FirestoreDocument;
        return normalizeCollege(slug, decodeFields(document.fields || {}));
      }
    } catch (error) {
      if (process.env.NODE_ENV !== "production") console.warn("College lookup fell back to reference data:", error);
    }
  }
  return SEED_COLLEGES.find((college) => college.slug === slug || college.id === slug) || null;
}

export const getCollegeById = getCollegeBySlug;
export async function getAvailableStates() { return [...INDIAN_STATES]; }
export async function getAllColleges() { return fetchFirestoreColleges(60); }
