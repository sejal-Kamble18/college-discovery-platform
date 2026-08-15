import type { ReservationCategory } from "@/types/college";

export type SupportedExam = "JEE Advanced" | "JEE Main" | "NEET" | "CAT" | "BITSAT";
export type ScoreMode = "rank" | "score" | "percentile";
export type PredictionBand = "likely" | "possible" | "reach";
export type PredictionDataSource = "firestore" | "reference-seed";

export interface CutoffRecord {
  id: string;
  collegeId: string;
  collegeSlug?: string;
  collegeName: string;
  shortName: string;
  city: string;
  state: string;
  exam: SupportedExam;
  category: ReservationCategory;
  mode: ScoreMode;
  cutoff: number;
  year: number;
  courseName?: string;
  round?: string;
  quota?: string;
  sourceAuthority?: string;
  sourceUrl?: string;
  datasetVersion: string;
  isVerified: boolean;
}

export interface PredictionRequest {
  exam: SupportedExam;
  category: ReservationCategory;
  value: number;
  state?: string;
  course?: string;
  quota?: string;
  year?: number;
  page?: number;
  pageSize?: number;
}

export interface PredictionResult {
  cutoffRecordId: string;
  college: {
    id: string;
    slug?: string;
    name: string;
    shortName: string;
    city: string;
    state: string;
  };
  exam: SupportedExam;
  category: ReservationCategory;
  mode: ScoreMode;
  inputValue: number;
  cutoff: number;
  margin: number;
  band: PredictionBand;
  eligible: boolean;
  courseName?: string;
  round?: string;
  quota?: string;
  cutoffYear: number;
  datasetVersion: string;
  evidenceQuality: "verified-source" | "reference-only";
  sourceAuthority?: string;
  sourceUrl?: string;
  explanation: string;
}

export interface PredictionResponse {
  results: PredictionResult[];
  total: number;
  datasetSize: number;
  page: number;
  pageSize: number;
  totalPages: number;
  dataSource: PredictionDataSource;
  methodology: string;
  disclaimer: string;
}
