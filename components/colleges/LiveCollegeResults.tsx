"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ExternalCollege, ExternalCollegeSearchResponse } from "@/types";

interface LiveCollegeResultsProps {
  query: string;
  state: string;
  excludeNames?: string[];
}

function normalizedName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function sourceLabel(source: ExternalCollege["source"]) {
  if (source === "aishe-firestore") return "AISHE directory";
  if (source === "google-places") return "Google Places";
  return "Public source";
}

export function LiveCollegeResults({ query, state, excludeNames = [] }: LiveCollegeResultsProps) {
  const normalizedQuery = query.trim();
  const requestKey = `${normalizedQuery.toLowerCase()}|${state.toLowerCase()}`;
  const shouldSearch = normalizedQuery.length >= 2 || Boolean(state);
  const [response, setResponse] = useState<{
    key: string;
    results: ExternalCollege[];
    message: string;
  }>({ key: "", results: [], message: "" });

  useEffect(() => {
    if (!shouldSearch) return;
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (normalizedQuery) params.set("q", normalizedQuery);
    if (state) params.set("state", state);

    fetch(`/api/colleges/search?${params.toString()}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (apiResponse) => {
        const data = (await apiResponse.json()) as ExternalCollegeSearchResponse & { error?: string };
        if (!apiResponse.ok) throw new Error(data.error || "Live search failed.");
        setResponse({ key: requestKey, results: data.results, message: data.message || "" });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setResponse({
          key: requestKey,
          results: [],
          message: error instanceof Error ? error.message : "Live search failed.",
        });
      });

    return () => controller.abort();
  }, [normalizedQuery, requestKey, shouldSearch, state]);

  const excluded = useMemo(() => new Set(excludeNames.map(normalizedName)), [excludeNames]);
  const loading = shouldSearch && response.key !== requestKey;
  const results = loading ? [] : response.results.filter((college) => !excluded.has(normalizedName(college.name)));

  if (!shouldSearch) return null;

  return (
    <section className="mb-10 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-5 sm:p-7" aria-live="polite">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-700">Live public directory</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">
            {state ? `Institutions in ${state}` : "Institutions matching your search"}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            These results are fetched when you search and are not saved to Firebase. Open the source profile, then confirm admissions on the institution website.
          </p>
        </div>
        {!loading && <span className="w-fit rounded-full bg-white px-3 py-1.5 text-sm font-bold text-slate-700 shadow-sm">{results.length} live matches</span>}
      </div>

      {loading && (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {[0, 1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-xl border border-blue-100 bg-white/80" />)}
        </div>
      )}

      {!loading && response.message && results.length === 0 && (
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{response.message}</p>
      )}

      {!loading && results.length === 0 && !response.message && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-sm leading-6 text-slate-600">
          No additional public-directory match was found. Try the full institution name, a shorter spelling, or select its state.
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          {response.message && <p className="mt-5 text-xs leading-5 text-slate-500">{response.message}</p>}
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {results.map((college) => (
              <article key={college.externalId} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                      {sourceLabel(college.source)}
                    </span>
                    <h3 className="mt-3 text-lg font-black leading-snug text-slate-900">{college.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{college.formattedAddress}</p>
                  </div>
                  {college.rating !== undefined && (
                    <span className="whitespace-nowrap rounded-lg bg-amber-50 px-2.5 py-1.5 text-sm font-bold text-amber-800">★ {college.rating.toFixed(1)}</span>
                  )}
                </div>
                {college.description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{college.description}</p>}
                <div className="mt-auto flex flex-wrap gap-3 pt-5">
                  {college.source === "google-places" && (
                    <Link href={`/colleges/external/${encodeURIComponent(college.externalId)}`} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700">
                      View live details
                    </Link>
                  )}
                  {college.website && (
                    <a href={college.website} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                      Open source ↗
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
