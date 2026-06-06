import type { CollegeType, CollegeCategory } from './college';

// ─── Sort Options ──────────────────────────────────────────────────────────

export type SortField = 'ranking' | 'fees' | 'rating' | 'name' | 'established';
export type SortOrder = 'asc' | 'desc';

// ─── Filter State ──────────────────────────────────────────────────────────

export interface SearchFilters {
  query: string;
  type: CollegeType | '';
  category: CollegeCategory | '';
  state: string;
  exam: string;
  minFees: number;
  maxFees: number;
  minRating: number;
  maxRating: number;
  sortBy: SortField;
  sortOrder: SortOrder;
  page: number;
}

/**
 * URL-safe version: all values are strings.
 * Parsed in the page RSC via `searchParams`.
 */
export type SearchParams = Partial<Record<keyof SearchFilters, string>>;

// ─── Defaults ──────────────────────────────────────────────────────────────

export const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  type: '',
  category: '',
  state: '',
  exam: '',
  minFees: 0,
  maxFees: 5_000_000,
  minRating: 0,
  maxRating: 5,
  sortBy: 'ranking',
  sortOrder: 'asc',
  page: 1,
};

export const ITEMS_PER_PAGE = 12;
