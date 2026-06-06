// ─── Enums / Union Types ───────────────────────────────────────────────────

export type CollegeType = 'government' | 'private' | 'deemed' | 'autonomous';

export type CollegeCategory =
  | 'engineering'
  | 'medical'
  | 'management'
  | 'law'
  | 'arts'
  | 'science'
  | 'architecture';

export type ReservationCategory = 'general' | 'obc' | 'sc' | 'st' | 'ews';

export type DegreeType =
  | 'B.Tech'
  | 'M.Tech'
  | 'MBA'
  | 'MBBS'
  | 'BDS'
  | 'B.Arch'
  | 'B.Sc'
  | 'M.Sc'
  | 'BBA'
  | 'B.Com'
  | 'LLB';

// ─── Sub-interfaces ────────────────────────────────────────────────────────

export interface CollegeLocation {
  city: string;
  state: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface CollegeRanking {
  nirf: number | null;
  year: number;
  /** Optional: specific category ranking, e.g. "Engineering" */
  category?: string;
}

export interface CollegeFees {
  tuitionPerYear: number;
  totalFees: number;
  hostelPerYear: number;
}

export interface CourseSeatDistribution {
  general: number;
  obc: number;
  sc: number;
  st: number;
  ews: number;
  total: number;
}

export interface ExamCutoff {
  general: number;
  obc: number;
  sc: number;
  st: number;
  ews: number;
  year: number;
}

// ─── Primary Entities ──────────────────────────────────────────────────────

export interface Course {
  id: string;
  name: string;
  degree: DegreeType;
  duration: number; // in years
  seats: CourseSeatDistribution;
  feesPerYear: number;
  eligibility: string;
}

export interface PlacementData {
  year: number;
  averagePackage: number; // in LPA
  highestPackage: number; // in LPA
  medianPackage: number; // in LPA
  placementRate: number; // 0–100 (percent)
  topRecruiters: string[];
}

export interface College {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  type: CollegeType;
  category: CollegeCategory;
  location: CollegeLocation;
  ranking: CollegeRanking;
  fees: CollegeFees;
  rating: number; // 0–5
  reviewCount: number;
  exams: string[]; // ['JEE Advanced', 'JEE Main', ...]
  cutoffs: Record<string, ExamCutoff>;
  accreditation: string; // 'NAAC A++', 'NBA', etc.
  facilities: string[];
  courses: Course[];
  placements: PlacementData[];
  imageUrl: string;
  logoUrl: string;
  galleryUrls: string[];
  website: string;
  established: number; // year
  totalStudents: number;
  facultyCount: number;
  isVerified: boolean;
  /** Denormalized tokens for Firestore array-contains search */
  searchTokens: string[];
  createdAt: string; // ISO timestamp string
  updatedAt: string;
}

// ─── Projection types ──────────────────────────────────────────────────────

/**
 * Lightweight version of College used in listing pages and cards.
 * Avoids fetching heavy subcollection data (courses, placements, gallery).
 */
export type CollegeListItem = Pick<
  College,
  | 'id'
  | 'slug'
  | 'name'
  | 'shortName'
  | 'type'
  | 'category'
  | 'location'
  | 'ranking'
  | 'fees'
  | 'rating'
  | 'reviewCount'
  | 'exams'
  | 'accreditation'
  | 'imageUrl'
  | 'logoUrl'
  | 'established'
  | 'isVerified'
>;

/**
 * Lightweight payload persisted in client-side compare/saved stores.
 * Full detail data is still resolved from the seed/service layer by slug/id.
 */
export type CollegeCompareItem = CollegeListItem;
