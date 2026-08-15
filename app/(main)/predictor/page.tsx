"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { INDIAN_STATES } from "@/constants/filters";
import {
  deletePredictionScenario,
  savePredictionScenario,
  subscribeToPredictionScenarios,
  type SavedPredictionScenario,
} from "@/lib/firestore/predictor-results";
import { useSubscription } from "@/lib/hooks/useSubscription";
import type { PredictionRequest, PredictionResponse, ReservationCategory, SupportedExam } from "@/types";

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
const QUOTAS = ["All India", "Home State", "Other State", "Not specified"];

export default function PredictorPage() {
  const { user } = useAuth();
  const { isPro, loading: planLoading } = useSubscription();
  const [exam, setExam] = useState<SupportedExam>("JEE Advanced");
  const [category, setCategory] = useState<ReservationCategory>("general");
  const [value, setValue] = useState("");
  const [state, setState] = useState("");
  const [course, setCourse] = useState("");
  const [quota, setQuota] = useState("");
  const [year, setYear] = useState("");
  const [response, setResponse] = useState<PredictionResponse | null>(null);
  const [lastRequest, setLastRequest] = useState<PredictionRequest | null>(null);
  const [scenarioSnapshot, setScenarioSnapshot] = useState<{ uid: string; items: SavedPredictionScenario[] } | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const config = EXAMS[exam];
  const scenarios = user && scenarioSnapshot?.uid === user.uid ? scenarioSnapshot.items : [];

  useEffect(() => {
    if (!user || !isPro) return;
    const uid = user.uid;
    return subscribeToPredictionScenarios(
      uid,
      (items) => setScenarioSnapshot({ uid, items }),
      () => setSaveMessage("Saved scenarios could not be loaded."),
    );
  }, [isPro, user]);

  async function runPrediction(page = 1) {
    setError("");
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue < config.min || numericValue > config.max) {
      setError(`Enter a value between ${config.min} and ${config.max}.`);
      return;
    }

    setLoading(true);
    try {
      const predictionRequest: PredictionRequest = {
        exam,
        category,
        value: numericValue,
        state: state || undefined,
        course: course || undefined,
        quota: quota || undefined,
        year: year ? Number(year) : undefined,
        page,
        pageSize: 20,
      };
      const token = user ? await user.getIdToken() : undefined;
      const apiResponse = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(predictionRequest),
      });
      const data = (await apiResponse.json()) as PredictionResponse & { error?: string };
      if (!apiResponse.ok) throw new Error(data.error || "Prediction failed.");
      setResponse(data);
      setLastRequest(predictionRequest);
      setSaveMessage("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Prediction failed.");
    } finally {
      setLoading(false);
    }
  }

  async function saveCurrentScenario() {
    if (!user || !isPro || !lastRequest || !response) return;
    try {
      await savePredictionScenario(user.uid, lastRequest, response);
      setSaveMessage("Scenario saved.");
    } catch (requestError) {
      setSaveMessage(requestError instanceof Error ? requestError.message : "Scenario could not be saved.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
      <div className="mb-8 border-b border-slate-200 pb-8">
        <p className="text-sm font-bold uppercase tracking-widest text-brand-700">Evidence-based planning tool</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-5xl">College Predictor</h1>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-slate-600">
          Build a practical likely, possible and reach list from stored cutoff records. Refine by state, course, quota and year when the source dataset provides them.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        <aside>
          <form
            className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24"
            onSubmit={(event) => { event.preventDefault(); void runPrediction(1); }}
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <Field label="Entrance exam" htmlFor="exam">
                <select id="exam" value={exam} onChange={(event) => { setExam(event.target.value as SupportedExam); setValue(""); setResponse(null); }} className="field-control">
                  {Object.keys(EXAMS).map((name) => <option key={name}>{name}</option>)}
                </select>
              </Field>
              <Field label="Reservation category" htmlFor="category">
                <select id="category" value={category} onChange={(event) => setCategory(event.target.value as ReservationCategory)} className="field-control">
                  {CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </Field>
            </div>

            <Field label={config.label} htmlFor="score">
              <input id="score" type="number" inputMode="decimal" step={exam === "JEE Main" || exam === "CAT" ? "0.01" : "1"} min={config.min} max={config.max} required value={value} onChange={(event) => setValue(event.target.value)} className="field-control" placeholder={`Enter ${config.label.toLowerCase()}`} />
              <p className="mt-1.5 text-xs text-slate-500">Allowed range: {config.min.toLocaleString("en-IN")}–{config.max.toLocaleString("en-IN")}</p>
            </Field>

            <details className="group rounded-xl border border-slate-200 bg-slate-50 p-4">
              <summary className="cursor-pointer list-none text-sm font-bold text-slate-800 marker:hidden">
                <span className="flex items-center justify-between gap-3">
                  <span>Advanced filters {!planLoading && !isPro && <span className="ml-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-violet-700">Pro</span>}</span>
                  <span className="text-brand-700 transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
                {!planLoading && !isPro && (
                  <p className="rounded-lg border border-violet-200 bg-violet-50 p-3 text-xs leading-5 text-violet-900">
                    Core prediction is free. <Link href="/pricing" className="font-black text-violet-700 hover:underline">Upgrade to Pro</Link> for state, course, quota and year filters.
                  </p>
                )}
                <Field label="Preferred state" htmlFor="state">
                  <select id="state" disabled={!isPro} value={state} onChange={(event) => setState(event.target.value)} className="field-control disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">
                    <option value="">All India</option>
                    {INDIAN_STATES.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </Field>
                <Field label="Course or branch" htmlFor="course">
                  <input id="course" disabled={!isPro} value={course} onChange={(event) => setCourse(event.target.value)} className="field-control disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400" placeholder="e.g. Computer Science" maxLength={100} />
                </Field>
                <Field label="Quota" htmlFor="quota">
                  <select id="quota" disabled={!isPro} value={quota} onChange={(event) => setQuota(event.target.value)} className="field-control disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400">
                    <option value="">Any quota</option>
                    {QUOTAS.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </Field>
                <Field label="Cutoff year" htmlFor="year">
                  <input id="year" disabled={!isPro} type="number" min="2000" max={new Date().getFullYear() + 1} value={year} onChange={(event) => setYear(event.target.value)} className="field-control disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400" placeholder="Newest available" />
                </Field>
              </div>
            </details>

            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            <button disabled={loading} className="w-full rounded-xl bg-brand-600 px-4 py-3.5 font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-50">
              {loading ? "Checking verified records…" : "Build my college range"}
            </button>
            <p className="text-xs leading-5 text-slate-500">This tool shows planning bands, not guaranteed admission percentages.</p>
          </form>

          {isPro && user && (
            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-slate-950">Saved scenarios</h2>
                <span className="rounded-full bg-violet-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-violet-700">Pro</span>
              </div>
              {scenarios.length === 0 ? <p className="mt-3 text-sm leading-6 text-slate-500">Run a prediction, then save it here for quick reference.</p> : (
                <ul className="mt-3 space-y-2">
                  {scenarios.map((scenario) => (
                    <li key={scenario.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 text-sm">
                      <div className="min-w-0"><p className="truncate font-bold text-slate-800">{scenario.exam} · {scenario.value}</p><p className="text-xs capitalize text-slate-500">{scenario.category} · {scenario.total} matches</p></div>
                      <button type="button" onClick={() => void deletePredictionScenario(user.uid, scenario.id)} className="text-xs font-bold text-slate-500 hover:text-red-700" aria-label={`Delete ${scenario.exam} scenario`}>Delete</button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </aside>

        <main aria-live="polite">
          {!response && !loading && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-br from-slate-950 to-blue-950 p-8 text-white sm:p-10">
                <p className="text-sm font-bold uppercase tracking-widest text-blue-300">How to read the result</p>
                <h2 className="mt-3 text-2xl font-extrabold">Three honest planning bands</h2>
              </div>
              <div className="grid gap-px bg-slate-200 sm:grid-cols-3">
                <BandHelp label="Likely" copy="Inside the reference cutoff by a planning buffer." className="text-emerald-700" />
                <BandHelp label="Possible" copy="Meets the reference but sits near its boundary." className="text-blue-700" />
                <BandHelp label="Reach" copy="Beyond the reference; keep an alternative ready." className="text-amber-800" />
              </div>
              <p className="p-6 text-sm leading-6 text-slate-600">Start with your exam result. Optional filters become most useful after verified course-, round- and quota-level cutoffs are imported into Firestore.</p>
            </div>
          )}

          {loading && !response && <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center font-semibold text-slate-600">Comparing cutoff records…</div>}

          {response && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Stat label="Matches" value={String(response.total)} />
                  <Stat label="Records checked" value={String(response.datasetSize)} />
                  <Stat label="Data source" value={response.dataSource === "firestore" ? "Firestore" : "Reference seed"} />
                </div>
                <p className="mt-5 text-sm leading-6 text-slate-600">{response.methodology}</p>
                <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950">{response.disclaimer}</p>
                {isPro && user && response.results.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                    <button type="button" onClick={() => void saveCurrentScenario()} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700">Save scenario</button>
                    <button type="button" onClick={() => exportPredictionCsv(response)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Export CSV</button>
                    {saveMessage && <span className="text-sm font-semibold text-slate-600">{saveMessage}</span>}
                  </div>
                )}
              </div>

              {response.results.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                  <h2 className="font-bold text-slate-900">No matching cutoff records</h2>
                  <p className="mt-2 text-sm text-slate-600">Remove a state, course, quota or year filter and try again. A broad college directory result does not automatically include verified cutoff data.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <h2 className="text-xl font-extrabold text-slate-950">Your planning range</h2>
                    <p className="text-sm text-slate-500">Page {response.page} of {response.totalPages}</p>
                  </div>
                  {response.results.map((result) => (
                    <article key={result.cutoffRecordId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${result.band === "likely" ? "bg-emerald-50 text-emerald-700" : result.band === "possible" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-800"}`}>{result.band}</span>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${result.evidenceQuality === "verified-source" ? "bg-violet-50 text-violet-700" : "bg-slate-100 text-slate-600"}`}>{result.evidenceQuality === "verified-source" ? "Verified source" : "Reference only"}</span>
                            <span className="text-xs font-semibold text-slate-500">{result.cutoffYear} · {result.datasetVersion}</span>
                          </div>
                          <h3 className="mt-3 text-lg font-bold text-slate-950">{result.college.name}</h3>
                          <p className="mt-1 text-sm text-slate-600">{result.college.city}, {result.college.state}</p>
                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
                            {result.courseName && <span>Course: {result.courseName}</span>}
                            {result.quota && <span>Quota: {result.quota}</span>}
                            {result.round && <span>Round: {result.round}</span>}
                          </div>
                          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-700">{result.explanation}</p>
                        </div>
                        <div className="shrink-0 rounded-xl bg-slate-50 px-5 py-4 text-left sm:text-right">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Stored cutoff</p>
                          <p className="mt-1 text-2xl font-extrabold text-slate-950">{result.cutoff.toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-sm font-bold">
                        {result.college.slug && <Link href={`/colleges/${result.college.slug}`} className="text-brand-700 hover:text-brand-800">View profile →</Link>}
                        {result.sourceUrl && <a href={result.sourceUrl} target="_blank" rel="noreferrer" className="text-slate-700 hover:text-slate-950">Open {result.sourceAuthority || "cutoff source"} ↗</a>}
                      </div>
                    </article>
                  ))}

                  {response.totalPages > 1 && (
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
                      <button type="button" disabled={loading || response.page <= 1} onClick={() => void runPrediction(response.page - 1)} className="rounded-lg px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40">← Previous</button>
                      <span className="text-sm font-semibold text-slate-500">{response.page} / {response.totalPages}</span>
                      <button type="button" disabled={loading || response.page >= response.totalPages} onClick={() => void runPrediction(response.page + 1)} className="rounded-lg px-4 py-2 text-sm font-bold text-brand-700 hover:bg-brand-50 disabled:opacity-40">Next →</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return <div><label htmlFor={htmlFor} className="text-sm font-bold text-slate-700">{label}</label><div className="mt-2">{children}</div></div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-xl font-extrabold text-slate-950">{value}</p></div>;
}

function BandHelp({ label, copy, className }: { label: string; copy: string; className: string }) {
  return <div className="bg-white p-6"><p className={`font-extrabold ${className}`}>{label}</p><p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p></div>;
}

function exportPredictionCsv(response: PredictionResponse) {
  const safeCell = (value: string | number | undefined) => {
    const text = String(value ?? "");
    const protectedText = /^[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${protectedText.replaceAll('"', '""')}"`;
  };
  const rows = [
    ["College", "State", "Band", "Cutoff", "Year", "Course", "Quota", "Round", "Evidence", "Source"],
    ...response.results.map((result) => [
      result.college.name,
      result.college.state,
      result.band,
      result.cutoff,
      result.cutoffYear,
      result.courseName,
      result.quota,
      result.round,
      result.evidenceQuality,
      result.sourceUrl,
    ]),
  ];
  const csv = rows.map((row) => row.map((cell) => safeCell(cell)).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `edudiscover-prediction-page-${response.page}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
