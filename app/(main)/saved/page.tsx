'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getColleges } from '@/lib/firestore/colleges';
import { formatFees, formatRating, formatRank } from '@/lib/utils/format';
import type { CollegeListItem } from '@/types';

interface SavedCollege extends CollegeListItem {
  savedAt: Date;
}

// Using localStorage for mock implementation
const STORAGE_KEY = 'saved-colleges';

export default function SavedCollegesPage() {
  const [savedColleges, setSavedColleges] = useState<SavedCollege[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  // Load saved colleges from localStorage
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { colleges } = await getColleges({});

        // Load saved college IDs from localStorage
        const savedIds = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as string[];
        const savedCollegeLists = colleges
          .filter((c) => savedIds.includes(c.id))
          .map((c) => ({
            ...c,
            savedAt: new Date(),
          }));
        setSavedColleges(savedCollegeLists);
      } catch (error) {
        console.error('Error loading colleges:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Remove from saved
  const handleRemove = (collegeId: string) => {
    setSavedColleges((prev) => prev.filter((c) => c.id !== collegeId));
    const savedIds = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as string[];
    const updatedIds = savedIds.filter((id) => id !== collegeId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedIds));
  };

  // Filter colleges
  const filteredColleges = savedColleges.filter(
    (c) =>
      c.name.toLowerCase().includes(filter.toLowerCase()) ||
      c.location.city.toLowerCase().includes(filter.toLowerCase()) ||
      c.location.state.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4" />
          <p className="text-slate-600">Loading your saved colleges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
      {/* Header */}
      <div className="mb-8 md:mb-12 border-b border-slate-200 pb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
          Saved Colleges
        </h1>
        <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
          Keep track of your favorite colleges and compare them later.
        </p>
      </div>

      {savedColleges.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h0m0 7h0m0 7h0m4-14h0m0 7h0m0 7h0" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No saved colleges yet</h2>
          <p className="text-slate-600 max-w-sm mb-8">
            Start exploring colleges and save your favorites to compare them later.
          </p>
          <Link href="/colleges" className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-sm transition-colors">
            Browse Colleges
          </Link>
        </div>
      ) : (
        <>
          {/* Search & Actions */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <input
              type="text"
              placeholder="Search saved colleges..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
            <p className="text-sm text-slate-600 font-medium whitespace-nowrap">
              {filteredColleges.length} of {savedColleges.length}
            </p>
          </div>

          {filteredColleges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <p className="text-slate-600">No colleges match your search. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredColleges.map((college) => (
                <div key={college.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                  {/* Header */}
                  <div className="relative h-32 w-full bg-gradient-to-br from-slate-100 to-slate-200">
                    {college.imageUrl && (
                      <Image src={college.imageUrl} alt={college.name} fill unoptimized className="object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <button
                      onClick={() => handleRemove(college.id)}
                      className="absolute top-3 right-3 bg-white hover:bg-slate-100 rounded-full p-1.5 shadow-md transition-colors"
                      title="Remove from saved"
                    >
                      <svg className="w-5 h-5 text-slate-700" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 011.414-1.414L9 14.586l5.293-5.293a1 1 0 011.414 1.414l-6 6z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Logo & Name */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden p-1">
                        <Image src={college.logoUrl} alt={college.shortName} width={40} height={40} unoptimized className="object-contain" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{college.name}</h3>
                        <p className="text-xs text-slate-500">{college.location.city}, {college.location.state}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-xs text-slate-600 font-semibold">Rating</p>
                        <p className="text-sm font-bold text-slate-900">★ {formatRating(college.rating)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-xs text-slate-600 font-semibold">NIRF Rank</p>
                        <p className="text-sm font-bold text-slate-900">{college.ranking.nirf ? formatRank(college.ranking.nirf) : 'N/A'}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-xs text-slate-600 font-semibold">Fees/Yr</p>
                        <p className="text-sm font-bold text-slate-900">{formatFees(college.fees.tuitionPerYear)}</p>
                      </div>
                    </div>

                    {/* Type & Category */}
                    <div className="flex gap-2 mb-4">
                      <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 uppercase">
                        {college.type}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                        {college.category}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/colleges/${college.slug}`}
                        className="flex-1 text-center bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold py-2 rounded-lg transition-colors text-sm"
                      >
                        View Details
                      </Link>
                      <Link
                        href={`/compare?colleges=${college.id}`}
                        className="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-lg transition-colors text-sm"
                      >
                        Compare
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
