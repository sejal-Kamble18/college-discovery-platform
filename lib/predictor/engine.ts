import { loadCutoffRecords } from "@/lib/predictor/records";
import type {
  CutoffRecord,
  PredictionBand,
  PredictionDataSource,
  PredictionRequest,
  PredictionResponse,
  PredictionResult,
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

function planningBuffer(record: CutoffRecord) {
  if (record.mode === "rank") return Math.max(50, Math.min(1_000, record.cutoff * 0.1));
  if (record.mode === "percentile") return 1.5;
  return Math.max(10, EXAM_CONFIG[record.exam].max * 0.025);
}

function matchBand(record: CutoffRecord, margin: number): PredictionBand {
  if (margin >= planningBuffer(record)) return "likely";
  if (margin >= 0) return "possible";
  return "reach";
}

function explain(record: CutoffRecord, inputValue: number, margin: number, band: PredictionBand) {
  const comparison = record.mode === "rank"
    ? `Your rank ${inputValue.toLocaleString("en-IN")} is ${Math.abs(margin).toLocaleString("en-IN")} ${margin >= 0 ? "places inside" : "places beyond"} this closing-rank reference.`
    : `Your ${record.mode} ${inputValue.toLocaleString("en-IN")} is ${Math.abs(margin).toLocaleString("en-IN")} ${margin >= 0 ? "above" : "below"} this reference.`;
  const meaning = band === "likely"
    ? "It is inside the configured planning buffer."
    : band === "possible"
      ? "It meets the reference but is close to the boundary."
      : "It does not meet this reference; keep it as an aspirational option.";
  return `${comparison} ${meaning}`;
}

function latestRecords(records: CutoffRecord[], requestedYear?: number) {
  const sorted = [...records].sort((a, b) => b.year - a.year);
  if (requestedYear) return sorted.filter((record) => record.year === requestedYear);

  const latest = new Map<string, CutoffRecord>();
  for (const record of sorted) {
    const key = [record.collegeId, record.courseName || "", record.quota || "", record.round || ""].join("|");
    if (!latest.has(key)) latest.set(key, record);
  }
  return [...latest.values()];
}

export function evaluateCutoffRecords(
  records: CutoffRecord[],
  request: PredictionRequest,
  dataSource: PredictionDataSource,
): PredictionResponse {
  const normalizedCourse = request.course?.trim().toLowerCase();
  const normalizedQuota = request.quota?.trim().toLowerCase();
  const datasetSize = records.length;
  const filtered = latestRecords(
    records.filter((record) =>
      record.exam === request.exam &&
      record.category === request.category &&
      (!request.state || record.state === request.state) &&
      (!normalizedCourse || record.courseName?.toLowerCase().includes(normalizedCourse)) &&
      (!normalizedQuota || record.quota?.toLowerCase().includes(normalizedQuota)),
    ),
    request.year,
  );

  const results: PredictionResult[] = filtered.map((record) => {
    const margin = record.mode === "rank" ? record.cutoff - request.value : request.value - record.cutoff;
    const band = matchBand(record, margin);
    return {
      cutoffRecordId: record.id,
      college: {
        id: record.collegeId,
        slug: record.collegeSlug,
        name: record.collegeName,
        shortName: record.shortName,
        city: record.city,
        state: record.state,
      },
      exam: record.exam,
      category: record.category,
      mode: record.mode,
      inputValue: request.value,
      cutoff: record.cutoff,
      margin,
      band,
      eligible: margin >= 0,
      courseName: record.courseName,
      round: record.round,
      quota: record.quota,
      cutoffYear: record.year,
      datasetVersion: record.datasetVersion,
      evidenceQuality: record.isVerified && Boolean(record.sourceUrl) ? "verified-source" : "reference-only",
      sourceAuthority: record.sourceAuthority,
      sourceUrl: record.sourceUrl,
      explanation: explain(record, request.value, margin, band),
    };
  });

  const bandOrder: Record<PredictionBand, number> = { likely: 0, possible: 1, reach: 2 };
  results.sort((a, b) =>
    bandOrder[a.band] - bandOrder[b.band] ||
    Number(b.evidenceQuality === "verified-source") - Number(a.evidenceQuality === "verified-source") ||
    Math.abs(a.margin) - Math.abs(b.margin) ||
    a.college.name.localeCompare(b.college.name),
  );

  const pageSize = Math.max(1, Math.min(Math.trunc(request.pageSize || 20), 50));
  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, Math.trunc(request.page || 1)), totalPages);
  const start = (page - 1) * pageSize;

  return {
    results: results.slice(start, start + pageSize),
    total,
    datasetSize,
    page,
    pageSize,
    totalPages,
    dataSource,
    methodology: `Deterministic ${request.exam} cutoff matching. Likely, possible and reach are planning bands calculated from the stored ${EXAM_CONFIG[request.exam].mode} boundary; they are not admission probabilities. When no year is selected, the newest record for each college, course, quota and round is used.`,
    disclaimer: "No predictor can guarantee admission. Outcomes change by counselling year, course, round, quota, category, seat availability and official policy. Verify every result on the official counselling and institution websites.",
  };
}

export async function predictColleges(request: PredictionRequest) {
  const { records, dataSource } = await loadCutoffRecords(request.exam, request.category);
  return evaluateCutoffRecords(records, request, dataSource);
}
