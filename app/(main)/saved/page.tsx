"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CollegeGrid } from "@/components/colleges/CollegeGrid";
import { useSavedColleges } from "@/lib/hooks/useSavedColleges";

export default function SavedCollegesPage() {
  const { user, records, loading, error } = useSavedColleges();
  const [filter, setFilter] = useState("");
  const colleges = useMemo(() => {
    const query = filter.trim().toLowerCase();
    return records
      .map((record) => record.college)
      .filter((college) =>
        !query ||
        college.name.toLowerCase().includes(query) ||
        college.location.city.toLowerCase().includes(query) ||
        college.location.state.toLowerCase().includes(query),
      );
  }, [filter, records]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
      <div className="mb-8 border-b border-slate-200 pb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">Saved Colleges</h1>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-slate-600">
          Your shortlist is synchronized to your account and available across devices.
        </p>
      </div>

      {loading && <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">Loading your shortlist…</p>}
      {!loading && error && <p className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">{error}</p>}

      {!loading && !user && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Sign in to create a shortlist</h2>
          <p className="mx-auto mt-3 max-w-lg text-slate-600">Saved colleges are account-specific, so your choices remain private and available on every device.</p>
          <Link href="/auth/login" className="mt-6 inline-flex rounded-lg bg-brand-600 px-6 py-3 font-bold text-white hover:bg-brand-700">Sign in</Link>
        </div>
      )}

      {!loading && user && records.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Your shortlist is empty</h2>
          <p className="mt-3 text-slate-600">Browse the curated directory and select “Save college” on a profile.</p>
          <Link href="/colleges" className="mt-6 inline-flex rounded-lg bg-brand-600 px-6 py-3 font-bold text-white hover:bg-brand-700">Browse colleges</Link>
        </div>
      )}

      {!loading && user && records.length > 0 && (
        <>
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="search"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="Filter your saved colleges"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500 sm:max-w-md"
            />
            <span className="text-sm font-semibold text-slate-500">{colleges.length} saved</span>
          </div>
          <CollegeGrid colleges={colleges} />
        </>
      )}
    </div>
  );
}
