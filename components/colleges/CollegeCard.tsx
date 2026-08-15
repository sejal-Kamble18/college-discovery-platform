"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CollegeIdentity } from "@/components/colleges/CollegeIdentity";
import { useSavedColleges } from "@/lib/hooks/useSavedColleges";
import { useCompareStore } from "@/lib/store/useCompareStore";
import { formatFees, formatRank } from "@/lib/utils/format";
import type { CollegeListItem } from "@/types";

export function CollegeCard({ college }: { college: CollegeListItem }) {
  const { selectedColleges, toggleCollege } = useCompareStore();
  const { user, savedIds, toggle: toggleSaved } = useSavedColleges();
  const router = useRouter();
  const [saveError, setSaveError] = useState("");
  const isSelected = selectedColleges.some((item) => item.id === college.id);
  const isSaved = savedIds.has(college.id);
  const canAdd = selectedColleges.length < 3 || isSelected;

  return (
    <article className="group flex min-h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60">
      <div className="flex items-start justify-between gap-4">
        <CollegeIdentity shortName={college.shortName} category={college.category} className="h-12 w-12 flex-none text-sm" />
        <div className="flex flex-wrap justify-end gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${college.isVerified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
            {college.isVerified ? "Verified" : "Reference data"}
          </span>
          {college.ranking.nirf && (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
              NIRF {college.ranking.year} · {formatRank(college.ranking.nirf)}
            </span>
          )}
        </div>
      </div>

      <div className="mt-5">
        <Link href={`/colleges/${college.slug}`}>
          <h3 className="line-clamp-2 text-xl font-black leading-snug text-slate-900 transition-colors group-hover:text-brand-700">
            {college.name}
          </h3>
        </Link>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
          <svg className="h-4 w-4 flex-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657 13.414 20.9a2 2 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          {college.location.city}, {college.location.state}
        </p>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4">
        <div>
          <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tuition / year</dt>
          <dd className="mt-1 font-extrabold text-slate-900">{formatFees(college.fees.tuitionPerYear)}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Established</dt>
          <dd className="mt-1 font-extrabold text-slate-900">{college.established}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-600">{college.type}</span>
        <span className="rounded-md bg-violet-50 px-2 py-1 text-xs font-semibold capitalize text-violet-700">{college.category}</span>
        {college.exams.slice(0, 2).map((exam) => (
          <span key={exam} className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{exam}</span>
        ))}
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        Verify fees, cutoffs, courses, and application dates on the official institution or counselling website.
      </p>

      <div className="mt-auto grid grid-cols-[1fr_auto_auto] gap-2 pt-5">
        <Link href={`/colleges/${college.slug}`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-3 py-2 text-sm font-bold text-white hover:bg-brand-700">
          View profile
        </Link>
        <button
          type="button"
          onClick={() => toggleCollege(college)}
          disabled={!canAdd && !isSelected}
          aria-label={isSelected ? `Remove ${college.shortName} from comparison` : `Add ${college.shortName} to comparison`}
          aria-pressed={isSelected}
          title={!canAdd && !isSelected ? "Compare up to three colleges" : "Compare college"}
          className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border px-3 ${isSelected ? "border-brand-600 bg-brand-50 text-brand-700" : canAdd ? "border-slate-200 text-slate-600 hover:bg-slate-50" : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300"}`}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0-2-2h2a2 2 0 0 0-2 2" />
          </svg>
        </button>
        <button
          type="button"
          aria-label={isSaved ? `Remove ${college.shortName} from saved colleges` : `Save ${college.shortName}`}
          aria-pressed={isSaved}
          onClick={async () => {
            setSaveError("");
            if (!user) {
              router.push(`/auth/login?returnTo=${encodeURIComponent(`/colleges/${college.slug}`)}`);
              return;
            }
            try {
              await toggleSaved(college);
            } catch (error) {
              setSaveError(error instanceof Error ? error.message : "Could not update saved colleges.");
            }
          }}
          className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border px-3 text-lg ${isSaved ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
        >
          <span aria-hidden="true">{isSaved ? "♥" : "♡"}</span>
        </button>
      </div>
      {saveError && <p className="mt-2 text-xs font-medium text-red-700" role="alert">{saveError}</p>}
    </article>
  );
}
