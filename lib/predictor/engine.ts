import { SEED_COLLEGES } from "@/lib/data/colleges.seed";
import type {
  College,
  CollegeListItem,
  PredictionResponse,
  PredictionResult,
  ReservationCategory,
  ScoreMode,
  SupportedExam,
} from "@/types";

export const EXAM_CONFIG: Record<SupportedExam, { mode: ScoreMode; label: string; min: number; max: number }> = {
  "JEE Advanced": { mode: "rank", label: "All India Rank", min: 1, max: 200_000 },
  "JEE Main": { mode: "percentile", label: "Percentile", min: 0, max: 100 },
  NEET: { mode: "score", label: "NEET score", min: 0, max: 720 },
  CAT: { mode: "percentile", label: "Percentile", min: 0, max: 100 },
  BITSAT: { mode: "score", label: "BITSAT score", min: 0, max: 390 },
};

function listItem(college: College): CollegeListItem {
  const { id, slug, name, shortName, type, category, location, ranking, fees, rating, reviewCount, exams, accreditation, imageUrl, logoUrl, established, isVerified } = college;
  return { id, slug, name, shortName, type, category, location, ranking, fees, rating, reviewCount, exams, accreditation, imageUrl, logoUrl, established, isVerified };
}

export function predictColleges(
  exam: SupportedExam,
  category: ReservationCategory,
  inputValue: number,
): PredictionResponse {
  const config = EXAM_CONFIG[exam];
  const results: PredictionResult[] = [];

  for (const college of SEED_COLLEGES) {
    const cutoff = college.cutoffs[exam];
    const threshold = cutoff?.[category];
    if (!cutoff || typeof threshold !== "number") continue;

    const margin = config.mode === "rank" ? threshold - inputValue : inputValue - threshold;
    const eligible = margin >= 0;
    const scale = Math.max(Math.abs(threshold), 1);
    const relativeMargin = margin / scale;
    const chance: PredictionResult["chance"] =
      eligible && relativeMargin >= 0.1 ? "strong" : eligible ? "possible" : "reach";

    results.push({
      college: listItem(college),
      category,
      exam,
      cutoff: threshold,
      cutoffYear: cutoff.year,
      inputValue,
      eligible,
      margin,
      chance,
      mode: config.mode,
    });
  }

  results.sort((a, b) => {
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
    return Math.abs(a.margin) - Math.abs(b.margin);
  });

  return {
    results: results.slice(0, 30),
    datasetSize: results.length,
    methodology: `Deterministic comparison against the stored ${exam} ${config.mode === "rank" ? "closing-rank" : "score/percentile"} reference for the selected category. No randomness or AI-generated cutoff is used.`,
    disclaimer: "This is a planning aid based on a limited reference dataset, not an admission guarantee. Always verify current round, quota, course and category cutoffs on the official counselling website.",
  };
}
