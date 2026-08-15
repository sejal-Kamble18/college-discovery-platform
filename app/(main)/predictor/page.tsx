"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PredictionResponse, ReservationCategory, SupportedExam } from "@/types";

const EXAMS: Record<SupportedExam, { label: string; min: number; max: number }> = {
  "JEE Advanced": { label: "All India Rank", min: 1, max: 200000 },
  "JEE Main": { label: "Percentile", min: 0, max: 100 },
  NEET: { label: "NEET score", min: 0, max: 720 },
  CAT: { label: "Percentile", min: 0, max: 100 },
  BITSAT: { label: "BITSAT score", min: 0, max: 390 },
};
const CATEGORIES: Array<{ value: ReservationCategory; label: string }> = [
  { value: "general", label: "General" },
  { value: "obc", label: "OBC" },
  { value: "sc", label: "SC" },
  { value: "st", label: "ST" },
  { value: "ews", label: "EWS" },
];

export default function PredictorPage() {
  const [exam, setExam] = useState<SupportedExam>("JEE Advanced");
  const [category, setCategory] = useState<ReservationCategory>("general");
  const [value, setValue] = useState("");
  const [response, setResponse] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const config = EXAMS[exam];
  const eligibleCount = useMemo(() => response?.results.filter((result) => result.eligible).length || 0, [response]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
      <div className="mb-8 border-b border-slate-200 pb-8">
        <p className="text-sm font-bold uppercase tracking-widest text-brand-700">Cutoff matching tool</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">College Predictor</h1>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-slate-600">
          Compare your rank, score or percentile with stored category cutoffs. Results are deterministic and never generated randomly.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
        <aside>
          <form
            className="sticky top-24 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            onSubmit={async (event) => {
              event.preventDefault();
              setError("");
              setResponse(null);
              const numericValue = Number(value);
              if (!Number.isFinite(numericValue) || numericValue < config.min || numericValue > config.max) {
                setError(`Enter a value between ${config.min} and ${config.max}.`);
                return;
              }

              setLoading(true);
              try {
                const apiResponse = await fetch("/api/predict", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ exam, category, value: numericValue }),
                });
                const data = (await apiResponse.json()) as PredictionResponse & { error?: string };
                if (!apiResponse.ok) throw new Error(data.error || "Prediction failed.");
                setResponse(data);
              } catch (requestError) {
                setError(requestError instanceof Error ? requestError.message : "Prediction failed.");
              } finally {
                setLoading(false);
              }
            }}
          >
            <div>
              <label htmlFor="exam" className="text-sm font-bold text-slate-700">Entrance exam</label>
              <select id="exam" value={exam} onChange={(event) => { setExam(event.target.value as SupportedExam); setValue(""); setResponse(null); }} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 outline-none focus:ring-2 focus:ring-brand-500">
                {Object.keys(EXAMS).map((name) => <option key={name}>{name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="category" className="text-sm font-bold text-slate-700">Reservation category</label>
              <select id="category" value={category} onChange={(event) => setCategory(event.target.value as ReservationCategory)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 outline-none focus:ring-2 focus:ring-brand-500">
                {CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="score" className="text-sm font-bold text-slate-700">{config.label}</label>
              <input id="score" type="number" step={exam === "JEE Main" || exam === "CAT" ? "0.01" : "1"} min={config.min} max={config.max} required value={value} onChange={(event) => setValue(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500" />
              <p className="mt-1 text-xs text-slate-500">Allowed range: {config.min}–{config.max}</p>
            </div>
            {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            <button disabled={loading} className="w-full rounded-lg bg-brand-600 px-4 py-3 font-bold text-white hover:bg-brand-700 disabled:opacity-50">
              {loading ? "Checking cutoffs…" : "Check my chances"}
            </button>
          </form>
        </aside>

        <main>
          {!response && !loading && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <h2 className="text-2xl font-bold text-slate-900">Enter your exam result</h2>
              <p className="mx-auto mt-3 max-w-xl text-slate-600">The tool compares your input only with records that contain a cutoff for the selected exam and category.</p>
            </div>
          )}

          {response && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Stat label="Matching records" value={String(response.datasetSize)} />
                  <Stat label="At or above reference" value={String(eligibleCount)} />
                  <Stat label="Exam" value={exam} />
                </div>
                <p className="mt-5 text-sm leading-6 text-slate-600">{response.methodology}</p>
                <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">{response.disclaimer}</p>
              </div>

              {response.results.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">No cutoff records are available for this selection yet.</div>
              ) : (
                <div className="space-y-4">
                  {response.results.map((result) => (
                    <article key={result.college.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${result.chance === "strong" ? "bg-emerald-50 text-emerald-700" : result.chance === "possible" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-800"}`}>{result.chance}</span>
                            <span className="text-xs font-semibold text-slate-500">Reference year {result.cutoffYear}</span>
                          </div>
                          <h2 className="mt-3 text-lg font-bold text-slate-900">{result.college.name}</h2>
                          <p className="mt-1 text-sm text-slate-600">{result.college.location.city}, {result.college.location.state}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Stored cutoff</p>
                          <p className="mt-1 text-xl font-extrabold text-slate-900">{result.cutoff}</p>
                        </div>
                      </div>
                      <Link href={`/colleges/${result.college.slug}`} className="mt-5 inline-flex text-sm font-bold text-brand-700 hover:text-brand-800">View college profile →</Link>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-xl font-extrabold text-slate-900">{value}</p></div>;
}
