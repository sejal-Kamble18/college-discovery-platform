import { NextResponse } from "next/server";
import { EXAM_CONFIG, predictColleges } from "@/lib/predictor/engine";
import type { ReservationCategory, SupportedExam } from "@/types";

const CATEGORIES: ReservationCategory[] = ["general", "obc", "sc", "st", "ews"];

export async function POST(request: Request) {
  let body: { exam?: string; category?: string; value?: number };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "A valid JSON request body is required." }, { status: 400 });
  }

  const exam = body.exam as SupportedExam;
  const category = body.category as ReservationCategory;
  const value = Number(body.value);
  const config = EXAM_CONFIG[exam];

  if (!config || !CATEGORIES.includes(category) || !Number.isFinite(value) || value < config.min || value > config.max) {
    return NextResponse.json({ error: "Exam, category or score/rank is invalid." }, { status: 400 });
  }

  return NextResponse.json(predictColleges(exam, category, value), {
    headers: { "Cache-Control": "private, no-store" },
  });
}
