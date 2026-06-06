import type { CollegeType, CollegeCategory } from '@/types';

// ─── Indian States ─────────────────────────────────────────────────────────

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const;

// ─── College Types ─────────────────────────────────────────────────────────

export const COLLEGE_TYPE_OPTIONS: { value: CollegeType; label: string }[] = [
  { value: 'government', label: 'Government' },
  { value: 'private', label: 'Private' },
  { value: 'deemed', label: 'Deemed' },
  { value: 'autonomous', label: 'Autonomous' },
];

// ─── College Categories ────────────────────────────────────────────────────

export const COLLEGE_CATEGORY_OPTIONS: {
  value: CollegeCategory;
  label: string;
}[] = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'medical', label: 'Medical' },
  { value: 'management', label: 'Management' },
  { value: 'law', label: 'Law' },
  { value: 'arts', label: 'Arts & Humanities' },
  { value: 'science', label: 'Science' },
  { value: 'architecture', label: 'Architecture' },
];

// ─── Exams ─────────────────────────────────────────────────────────────────

export const EXAM_OPTIONS = [
  'JEE Main',
  'JEE Advanced',
  'NEET',
  'CAT',
  'GATE',
  'MAT',
  'XAT',
  'CLAT',
  'NATA',
  'CUET',
] as const;

// ─── Sort ──────────────────────────────────────────────────────────────────

export const SORT_OPTIONS = [
  { value: 'ranking', label: 'NIRF Ranking' },
  { value: 'fees', label: 'Fees (Low to High)' },
  { value: 'rating', label: 'Rating (High to Low)' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'established', label: 'Established (Oldest)' },
] as const;

// ─── Fees Range ────────────────────────────────────────────────────────────

export const FEES_RANGE = {
  min: 0,
  max: 5_000_000,
  step: 50_000,
} as const;

// ─── Rating Range ──────────────────────────────────────────────────────────

export const RATING_RANGE = {
  min: 0,
  max: 5,
  step: 0.5,
} as const;

// ─── Facilities ────────────────────────────────────────────────────────────

export const FACILITY_OPTIONS = [
  'Hostel',
  'Library',
  'Sports Complex',
  'Wi-Fi Campus',
  'Cafeteria',
  'Medical Center',
  'Auditorium',
  'Labs',
  'Gym',
  'Swimming Pool',
  'Placement Cell',
  'Research Center',
] as const;
