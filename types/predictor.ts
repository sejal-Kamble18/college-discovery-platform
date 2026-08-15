import type { CollegeListItem, ReservationCategory } from "@/types/college";

export type SupportedExam = "JEE Advanced" | "JEE Main" | "NEET" | "CAT" | "BITSAT";
export type ScoreMode = "rank" | "score" | "percentile";

export interface PredictionResult {
  college: CollegeListItem;
  category: ReservationCategory;
  exam: SupportedExam;
  cutoff: number;
  cutoffYear: number;
  inputValue: number;
  eligible: boolean;
  margin: number;
  chance: "strong" | "possible" | "reach";
  mode: ScoreMode;
}

export interface PredictionResponse {
  results: PredictionResult[];
  methodology: string;
  datasetSize: number;
  disclaimer: string;
}
