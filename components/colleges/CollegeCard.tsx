"use client";

import Link from 'next/link';
import { useCompareStore } from '@/lib/store/useCompareStore';
import type { CollegeListItem } from '@/types';
import { formatFees, formatRank, formatRating } from '@/lib/utils/format';
import { useSavedColleges } from '@/lib/hooks/useSavedColleges';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CollegeMedia } from '@/components/media/CollegeMedia';

interface CollegeCardProps {
  college: CollegeListItem;
}

export function CollegeCard({ college }: CollegeCardProps) {
  const { selectedColleges, toggleCollege } = useCompareStore();
  const { user, savedIds, toggle: toggleSaved } = useSavedColleges();
  const router = useRouter();
  const [saveError, setSaveError] = useState('');
  const isSelected = selectedColleges.some((c) => c.id === college.id);
  const isSaved = savedIds.has(college.id);
  const canAdd = selectedColleges.length < 3 || isSelected;

  return (
    <article className="group relative flex min-h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60">
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <CollegeMedia
          src={college.imageUrl}
          alt={college.isVerified ? `${college.name} campus` : ''}
          shortName={college.shortName}
          category={college.category}
          variant="cover"
          className="h-full w-full"
          imageClassName="transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-slate-950/10" />

        <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm backdrop-blur ${college.isVerified ? 'bg-emerald-600 text-white' : 'bg-white/95 text-slate-700'}`}>
            {college.isVerified ? 'Verified profile' : 'Reference data'}
          </span>
          {college.ranking.nirf && (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-sm backdrop-blur">
              NIRF {college.ranking.year} · {formatRank(college.ranking.nirf)}
            </span>
          )}
          {college.isVerified && (
            <span className="rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              ★ {formatRating(college.rating)}
            </span>
          )}
        </div>
      </div>

      <div className="relative flex flex-grow flex-col p-5 pt-6">
        <CollegeMedia
            src={college.logoUrl}
            alt={`${college.shortName} logo`}
            shortName={college.shortName}
            category={college.category}
            variant="logo"
            className="absolute -top-9 right-5 h-16 w-16 rounded-xl border-4 border-white bg-white shadow-md"
        />

        <div className="mb-4 pr-12">
          <Link href={`/colleges/${college.slug}`} className="block">
            <h3 className="line-clamp-2 text-lg font-extrabold leading-snug text-slate-900 transition-colors group-hover:text-brand-700">
              {college.name}
            </h3>
          </Link>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {college.location.city}, {college.location.state}
          </p>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-600">
            {college.type}
          </span>
          {college.exams.slice(0, 2).map(exam => (
            <span key={exam} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
              {exam}
            </span>
          ))}
          {college.exams.length > 2 && (
            <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
              +{college.exams.length - 2} more
            </span>
          )}
        </div>

        <div className="mt-auto border-t border-slate-100 pt-4">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Reference tuition / year</p>
              <p className="text-lg font-extrabold text-slate-900">
              {formatFees(college.fees.tuitionPerYear)}
              </p>
            </div>
            <p className="text-xs font-semibold text-slate-500">Est. {college.established}</p>
          </div>
          <div className="grid grid-cols-[1fr_auto_auto] gap-2">
            <Link
              href={`/colleges/${college.slug}`}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-700"
            >
              View college
            </Link>
            <button
              type="button"
              onClick={() => toggleCollege(college)}
              disabled={!canAdd && !isSelected}
              aria-label={isSelected ? `Remove ${college.shortName} from comparison` : `Add ${college.shortName} to comparison`}
              aria-pressed={isSelected}
              className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border px-3 py-2 transition-colors ${
                isSelected
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : canAdd
                    ? 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    : 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300'
              }`}
              title={!canAdd && !isSelected ? 'Max 3 colleges to compare' : ''}
            >
              <svg className={`w-4 h-4 ${isSelected ? 'fill-current' : ''}`} viewBox="0 0 24 24" stroke="currentColor" fill="none">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>
            <button
              type="button"
              aria-label={isSaved ? `Remove ${college.shortName} from saved colleges` : `Save ${college.shortName}`}
              aria-pressed={isSaved}
              onClick={async () => {
                setSaveError('');
                if (!user) {
                  router.push(`/auth/login?returnTo=${encodeURIComponent(`/colleges/${college.slug}`)}`);
                  return;
                }
                try {
                  await toggleSaved(college);
                } catch (error) {
                  setSaveError(error instanceof Error ? error.message : 'Could not update saved colleges.');
                }
              }}
              className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border px-3 py-2 text-lg transition-colors ${isSaved ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              <span aria-hidden="true">{isSaved ? '♥' : '♡'}</span>
            </button>
          </div>
          {saveError && <p className="mt-2 text-xs font-medium text-red-700" role="alert">{saveError}</p>}
        </div>
      </div>
    </article>
  );
}
