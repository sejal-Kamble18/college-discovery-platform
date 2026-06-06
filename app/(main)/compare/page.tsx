'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCompareStore } from '@/lib/store/useCompareStore';
import { getColleges } from '@/lib/firestore/colleges';
import { formatFees, formatRating, formatRank } from '@/lib/utils/format';
import type { CollegeListItem } from '@/types';

export default function ComparePage() {
  const { selectedColleges, removeCollege, clearCompare } = useCompareStore();
  const [collegeDetails, setCollegeDetails] = useState<(CollegeListItem | null)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedColleges.length === 0) {
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const { colleges: allColleges } = await getColleges({});
        const details = selectedColleges.map((item) =>
          allColleges.find((c) => c.id === item.id) || null
        );
        setCollegeDetails(details);
      } catch (error) {
        console.error('Error fetching college details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [selectedColleges]);

  if (selectedColleges.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">No Colleges to Compare</h2>
          <p className="text-lg text-slate-600 mb-8 max-w-md leading-relaxed">
            Add colleges from the listing to compare them side-by-side. Compare up to 3 colleges at once.
          </p>
          <Link
            href="/colleges"
            className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-sm transition-colors"
          >
            Browse Colleges
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
      {/* Header */}
      <div className="mb-8 md:mb-12 border-b border-slate-200 pb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
            Compare Colleges
          </h1>
          <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
            Side-by-side comparison of {selectedColleges.length} college{selectedColleges.length !== 1 ? 's' : ''}. Analyze fees, placements, courses, and more.
          </p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <button
            onClick={clearCompare}
            className="inline-flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 font-semibold transition-colors"
          >
            Clear All
          </button>
          <Link
            href="/colleges"
            className="inline-flex items-center justify-center rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 px-4 py-2.5 font-semibold transition-colors"
          >
            Add More
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4" />
            <p className="text-slate-600">Loading college details...</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="inline-block min-w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collegeDetails.map((college, idx) => (
                <div key={college?.id || idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  {/* Card Header */}
                  <div className="relative h-32 w-full bg-gradient-to-br from-slate-100 to-slate-200">
                    {college?.imageUrl && (
                      <Image
                        src={college.imageUrl}
                        alt={college.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <button
                      onClick={() => removeCollege(college!.id)}
                      className="absolute top-3 right-3 bg-white hover:bg-slate-100 rounded-full p-1.5 shadow-md transition-colors"
                      title="Remove from comparison"
                    >
                      <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    {college ? (
                      <>
                        {/* Logo & Name */}
                        <div className="flex items-start gap-3 mb-5">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden p-1">
                            <Image
                              src={college.logoUrl}
                              alt={college.shortName}
                              width={40}
                              height={40}
                              unoptimized
                              className="object-contain"
                            />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 text-lg leading-tight">{college.name}</h3>
                            <p className="text-sm text-slate-500 mt-0.5">{college.location.city}, {college.location.state}</p>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="space-y-3.5">
                          {/* Rating & Ranking */}
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Rating</p>
                              <p className="text-2xl font-bold text-brand-600">{formatRating(college.rating)}</p>
                              <p className="text-xs text-slate-500 mt-0.5">({college.reviewCount} reviews)</p>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">NIRF Rank</p>
                              <p className="text-2xl font-bold text-slate-900">
                                {college.ranking.nirf ? formatRank(college.ranking.nirf) : 'N/A'}
                              </p>
                            </div>
                          </div>

                          <hr className="border-slate-100" />

                          {/* Fees */}
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Annual Fees</p>
                            <p className="text-lg font-bold text-slate-900">{formatFees(college.fees.tuitionPerYear)}</p>
                            <p className="text-xs text-slate-500 mt-0.5">per year</p>
                          </div>

                          <hr className="border-slate-100" />

                          {/* Type & Category */}
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-2">Type</p>
                            <div className="flex flex-wrap gap-2">
                              <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 uppercase">
                                {college.type}
                              </span>
                              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                                {college.category}
                              </span>
                            </div>
                          </div>

                          <hr className="border-slate-100" />

                          {/* Entrance Exams */}
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-2">Entrance Exams</p>
                            <div className="flex flex-wrap gap-1.5">
                              {college.exams.map((exam) => (
                                <span key={exam} className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10">
                                  {exam}
                                </span>
                              ))}
                            </div>
                          </div>

                          <hr className="border-slate-100" />

                          {/* Accreditation */}
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-2">Accreditation</p>
                            <p className="text-sm text-slate-600 flex items-center gap-2">
                              <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {college.accreditation}
                            </p>
                          </div>

                          <hr className="border-slate-100" />

                          {/* CTA */}
                          <Link
                            href={`/colleges/${college.slug}`}
                            className="block w-full text-center bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg transition-colors mt-4"
                          >
                            View Full Details
                          </Link>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-slate-500">College not found</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
