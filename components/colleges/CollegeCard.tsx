"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCompareStore } from '@/lib/store/useCompareStore';
import type { CollegeListItem } from '@/types';
import { formatFees, formatRank, formatRating } from '@/lib/utils/format';

interface CollegeCardProps {
  college: CollegeListItem;
}

export function CollegeCard({ college }: CollegeCardProps) {
  const { selectedColleges, toggleCollege } = useCompareStore();
  const isSelected = selectedColleges.some((c) => c.id === college.id);
  const canAdd = selectedColleges.length < 3 || isSelected;

  return (
    <div className="group relative flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      {/* Cover Image & Top Badges */}
      <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
        {/* Placeholder gradient if image fails, but Next.js Image handles standard loading */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-slate-100" />

        {/* 
          Using unoptimized for mock URLs. 
          In production, configure next.config.ts remote patterns.
        */}
        <Image
          src={college.imageUrl}
          alt={college.name}
          fill
          unoptimized
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {college.ranking.nirf && (
            <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              NIRF {formatRank(college.ranking.nirf)}
            </span>
          )}
          <span className="bg-brand-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            ★ {formatRating(college.rating)}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-grow p-5 pt-6 relative">
        {/* Overlapping Logo */}
        <div className="absolute -top-8 right-5 w-14 h-14 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden p-1 flex items-center justify-center">
          <Image
            src={college.logoUrl}
            alt={`${college.shortName} Logo`}
            width={48}
            height={48}
            unoptimized
            className="object-contain"
          />
        </div>

        {/* Title & Location */}
        <div className="mb-4 pr-12">
          <Link href={`/colleges/${college.slug}`} className="block">
            <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-brand-600 transition-colors line-clamp-2">
              {college.name}
            </h3>
          </Link>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {college.location.city}, {college.location.state}
          </p>
        </div>

        {/* Badges (Type & Exams) */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 uppercase tracking-wider">
            {college.type}
          </span>
          {college.exams.slice(0, 2).map(exam => (
            <span key={exam} className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
              {exam}
            </span>
          ))}
          {college.exams.length > 2 && (
            <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
              +{college.exams.length - 2} more
            </span>
          )}
        </div>

        <hr className="border-slate-100 my-4" />

        {/* Footer: Fees & Actions */}
        <div className="flex flex-col gap-3 mt-auto">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-0.5">First Year Fee</p>
            <p className="text-lg font-bold text-slate-900">
              {formatFees(college.fees.tuitionPerYear)}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/colleges/${college.slug}`}
              className="flex-1 inline-flex items-center justify-center rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 px-3 py-2 text-sm font-semibold transition-colors"
            >
              View Details
            </Link>
            <button
              onClick={() => toggleCollege(college)}
              disabled={!canAdd && !isSelected}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                isSelected
                  ? 'bg-brand-600 hover:bg-brand-700 text-white'
                  : canAdd
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
              }`}
              title={!canAdd && !isSelected ? 'Max 3 colleges to compare' : ''}
            >
              <svg className={`w-4 h-4 ${isSelected ? 'fill-current' : ''}`} viewBox="0 0 24 24" stroke="currentColor" fill="none">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {isSelected ? 'Added' : 'Compare'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
