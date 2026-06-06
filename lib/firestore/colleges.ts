import type { College, CollegeListItem, SortField, SortOrder } from "@/types";
import { ITEMS_PER_PAGE } from "@/types/filters";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit as firestoreLimit,
  query as firestoreQuery,
} from "firebase/firestore";

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

const STATIC_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

function toCollege(docId: string, data: Record<string, unknown>): College {
  return {
    ...data,
    id: String(data.id ?? docId),
  } as College;
}

function toListItem(college: College): CollegeListItem {
  return {
    id: college.id,
    slug: college.slug,
    name: college.name,
    shortName: college.shortName,
    type: college.type,
    category: college.category,
    location: college.location,
    ranking: college.ranking,
    fees: college.fees,
    rating: college.rating,
    reviewCount: college.reviewCount,
    exams: college.exams,
    accreditation: college.accreditation,
    imageUrl: college.imageUrl,
    logoUrl: college.logoUrl,
    established: college.established,
    isVerified: college.isVerified,
  };
}

async function fetchCollegesFromFirestore(max = ITEMS_PER_PAGE): Promise<College[]> {
  const safeLimit = Math.max(1, Math.min(max, 120));

  const q = firestoreQuery(
    collection(db, "colleges"),
    firestoreLimit(safeLimit),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((snap) => toCollege(snap.id, snap.data()));
}

function compareColleges(
  a: College,
  b: College,
  sortBy: SortField,
  sortOrder: SortOrder,
): number {
  let aVal: number | string;
  let bVal: number | string;

  switch (sortBy) {
    case "ranking":
      aVal = a.ranking?.nirf ?? 9999;
      bVal = b.ranking?.nirf ?? 9999;
      break;
    case "fees":
      aVal = a.fees?.tuitionPerYear ?? 999999999;
      bVal = b.fees?.tuitionPerYear ?? 999999999;
      break;
    case "rating":
      aVal = a.rating ?? 0;
      bVal = b.rating ?? 0;
      break;
    case "name":
      aVal = a.name ?? "";
      bVal = b.name ?? "";
      break;
    case "established":
      aVal = a.established ?? 9999;
      bVal = b.established ?? 9999;
      break;
    default:
      aVal = a.ranking?.nirf ?? 9999;
      bVal = b.ranking?.nirf ?? 9999;
  }

  if (typeof aVal === "string" && typeof bVal === "string") {
    const cmp = aVal.localeCompare(bVal);
    return sortOrder === "desc" ? -cmp : cmp;
  }

  const diff = Number(aVal) - Number(bVal);
  return sortOrder === "desc" ? -diff : diff;
}

export async function getColleges(
  params: GetCollegesParams = {},
): Promise<GetCollegesResult> {
  const {
    query = "",
    state = "",
    type = "",
    category = "",
    exam = "",
    maxFees,
    minRating,
    sortBy = "ranking",
    sortOrder = "asc",
    page = 1,
  } = params;

  const limit = Math.max(1, params.limit ?? ITEMS_PER_PAGE);

  const hasFilters =
    Boolean(query.trim()) ||
    Boolean(state) ||
    Boolean(type) ||
    Boolean(category) ||
    Boolean(exam) ||
    maxFees !== undefined ||
    minRating !== undefined ||
    sortBy !== "ranking" ||
    sortOrder !== "asc";

  const fetchLimit = hasFilters
    ? 100
    : Math.min(limit * page, 100);

  let pool = await fetchCollegesFromFirestore(fetchLimit);

  if (query.trim()) {
    const q = query.trim().toLowerCase();

    pool = pool.filter((college) => {
      const tokens = Array.isArray(college.searchTokens)
        ? college.searchTokens
        : [];

      return (
        college.name?.toLowerCase().includes(q) ||
        college.shortName?.toLowerCase().includes(q) ||
        college.location?.city?.toLowerCase().includes(q) ||
        college.location?.state?.toLowerCase().includes(q) ||
        tokens.some((token) => String(token).toLowerCase().includes(q))
      );
    });
  }

  if (state) {
    pool = pool.filter((college) => college.location?.state === state);
  }

  if (type) {
    pool = pool.filter((college) => college.type === type);
  }

  if (category) {
    pool = pool.filter((college) => college.category === category);
  }

  if (exam) {
    pool = pool.filter((college) => college.exams?.includes(exam));
  }

  if (maxFees !== undefined && maxFees > 0) {
    pool = pool.filter(
      (college) => (college.fees?.tuitionPerYear ?? 0) <= maxFees,
    );
  }

  if (minRating !== undefined && minRating > 0) {
    pool = pool.filter((college) => (college.rating ?? 0) >= minRating);
  }

  pool.sort((a, b) => compareColleges(a, b, sortBy, sortOrder));

  const total = pool.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const offset = (safePage - 1) * limit;
  const paginated = pool.slice(offset, offset + limit);

  return {
    colleges: paginated.map(toListItem),
    total,
    page: safePage,
    totalPages,
  };
}

export async function getCollegeBySlug(slug: string): Promise<College | null> {
  const ref = doc(db, "colleges", slug);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  return toCollege(snap.id, snap.data());
}

export async function getCollegeById(id: string): Promise<College | null> {
  return getCollegeBySlug(id);
}

export async function getAvailableStates(): Promise<string[]> {
  return STATIC_STATES;
}

export async function getAllColleges(): Promise<College[]> {
  return fetchCollegesFromFirestore(60);
}