"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ExternalCollege, ExternalCollegeSearchResponse } from "@/types";

interface LiveCollegeResultsProps {
  query: string;
}

export function LiveCollegeResults({ query }: LiveCollegeResultsProps) {
  const normalizedQuery = query.trim();
  const [response, setResponse] = useState<{
    query: string;
    results: ExternalCollege[];
    message: string;
  }>({ query: "", results: [], message: "" });

  useEffect(() => {
    if (normalizedQuery.length < 3) return;

    const controller = new AbortController();

    fetch(`/api/colleges/search?q=${encodeURIComponent(normalizedQuery)}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const data = (await response.json()) as ExternalCollegeSearchResponse & { error?: string };
        if (!response.ok) throw new Error(data.error || "Live search failed.");
        setResponse({ query: normalizedQuery, results: data.results, message: data.message || "" });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setResponse({
          query: normalizedQuery,
          results: [],
          message: error instanceof Error ? error.message : "Live search failed.",
        });
      });

    return () => controller.abort();
  }, [normalizedQuery]);

  if (normalizedQuery.length < 3) return null;

  const loading = response.query !== normalizedQuery;
  const { results, message } = loading
    ? { results: [] as ExternalCollege[], message: "" }
    : response;

  return (
    <section className="mt-12 border-t border-slate-200 pt-8" aria-live="polite">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Live directory</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">More matching institutions</h2>
        <p className="mt-1 text-sm text-slate-600">
          Live results are fetched when you search and are not added to the EduDiscover database.
        </p>
      </div>

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Searching the live college directory…
        </div>
      )}

      {!loading && message && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {message}
        </div>
      )}

      {!loading && !message && results.length === 0 && (
        <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No additional live results were found.
        </p>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {results.map((college) => (
            <article key={college.externalId} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {college.source === "wikipedia" ? "Wikipedia result" : "Live result"}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-slate-900">{college.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{college.formattedAddress}</p>
                  {college.description && <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{college.description}</p>}
                </div>
                {college.rating !== undefined && (
                  <span className="whitespace-nowrap rounded-lg bg-amber-50 px-2.5 py-1.5 text-sm font-bold text-amber-800">
                    ★ {college.rating.toFixed(1)}
                  </span>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {college.source === "google-places" && (
                  <Link
                    href={`/colleges/external/${encodeURIComponent(college.externalId)}`}
                    className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    View live details
                  </Link>
                )}
                {college.website && (
                  <a
                    href={college.website}
                    target="_blank"
                    rel="noreferrer"
                    className={`rounded-lg px-4 py-2 text-sm font-semibold ${college.source === "google-places" ? "border border-slate-200 text-slate-700 hover:bg-slate-50" : "bg-brand-600 text-white hover:bg-brand-700"}`}
                  >
                    {college.source === "wikipedia" ? "Read source profile" : "Official website"}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
