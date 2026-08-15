import { NextResponse } from "next/server";
import { INDIAN_STATES } from "@/constants/filters";
import { EXAM_CONFIG, predictColleges } from "@/lib/predictor/engine";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { isProUser } from "@/lib/server/billing";
import { requireServerUser, ServerAuthError } from "@/lib/server/firebase-admin";
import type { PredictionRequest, ReservationCategory, SupportedExam } from "@/types";

const CATEGORIES: ReservationCategory[] = ["general", "obc", "sc", "st", "ews"];

function optionalText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized ? normalized.slice(0, maxLength) : undefined;
}

export async function POST(request: Request) {
  const clientAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "local";
  const rate = checkRateLimit(`predictor:${clientAddress}`, 20);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many prediction requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "A valid JSON request body is required." }, { status: 400 });
  }

  const exam = body.exam as SupportedExam;
  const category = body.category as ReservationCategory;
  const value = Number(body.value);
  const config = EXAM_CONFIG[exam];
  const requestedState = optionalText(body.state, 50);
  const state = requestedState
    ? INDIAN_STATES.find((item) => item.toLowerCase() === requestedState.toLowerCase())
    : undefined;
  const year = body.year === undefined || body.year === "" ? undefined : Number(body.year);
  const page = body.page === undefined ? 1 : Number(body.page);
  const pageSize = body.pageSize === undefined ? 20 : Number(body.pageSize);

  if (!config || !CATEGORIES.includes(category) || !Number.isFinite(value) || value < config.min || value > config.max) {
    return NextResponse.json({ error: "Exam, category or score/rank is invalid." }, { status: 400 });
  }
  if (requestedState && !state) {
    return NextResponse.json({ error: "Select a valid Indian state." }, { status: 400 });
  }
  if (year !== undefined && (!Number.isInteger(year) || year < 2000 || year > new Date().getFullYear() + 1)) {
    return NextResponse.json({ error: "Cutoff year is invalid." }, { status: 400 });
  }
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) {
    return NextResponse.json({ error: "Pagination values are invalid." }, { status: 400 });
  }

  const predictionRequest: PredictionRequest = {
    exam,
    category,
    value,
    state,
    course: optionalText(body.course, 100),
    quota: optionalText(body.quota, 50),
    year,
    page,
    pageSize,
  };

  const usesPremiumFilters = Boolean(
    predictionRequest.state || predictionRequest.course || predictionRequest.quota || predictionRequest.year,
  );
  if (usesPremiumFilters) {
    try {
      const user = await requireServerUser(request);
      if (!(await isProUser(user.uid))) {
        return NextResponse.json({ error: "Advanced predictor filters require an active Pro subscription." }, { status: 403 });
      }
    } catch (error) {
      if (error instanceof ServerAuthError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      if (process.env.NODE_ENV !== "production") console.error("Premium access check failed:", error);
      return NextResponse.json({ error: "Premium access could not be verified." }, { status: 503 });
    }
  }

  try {
    return NextResponse.json(await predictColleges(predictionRequest), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("Prediction failed:", error);
    return NextResponse.json({ error: "Prediction data is temporarily unavailable." }, { status: 503 });
  }
}
