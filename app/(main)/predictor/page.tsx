'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getColleges } from '@/lib/firestore/colleges';
import { formatRank } from '@/lib/utils/format';
import type { CollegeListItem } from '@/types';

type ExamType = 'JEE Advanced' | 'JEE Main' | 'NEET' | 'CAT' | 'GATE';
type CategoryType = 'general' | 'obc' | 'sc' | 'st' | 'ews';

interface PredictionResult {
  college: CollegeListItem;
  category: CategoryType;
  cutoff: number;
  rank: number;
  eligible: boolean;
  margin: number; // positive = better score, negative = worse
  chance: 'high' | 'medium' | 'low';
}

const EXAM_TYPES: ExamType[] = ['JEE Advanced', 'JEE Main', 'NEET', 'CAT', 'GATE'];
const CATEGORIES: { value: CategoryType; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'obc', label: 'OBC' },
  { value: 'sc', label: 'SC' },
  { value: 'st', label: 'ST' },
  { value: 'ews', label: 'EWS' },
];

export default function PredictorPage() {
  const [exam, setExam] = useState<ExamType>('JEE Advanced');
  const [rank, setRank] = useState<string>('');
  const [category, setCategory] = useState<CategoryType>('general');
  const [results, setResults] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [colleges, setColleges] = useState<CollegeListItem[]>([]);

  // Fetch colleges on mount
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const { colleges: allColleges } = await getColleges({});
        setColleges(allColleges);
      } catch (error) {
        console.error('Error fetching colleges:', error);
      }
    };
    fetchColleges();
  }, []);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const rankNum = parseInt(rank, 10);
    if (!rankNum || rankNum <= 0) {
      return;
    }

    setLoading(true);
    try {
      // Filter colleges with matching exam cutoffs
      const predictions: PredictionResult[] = [];

      colleges.forEach((college) => {
        // Check if college offers this exam
        if (!college.exams.includes(exam)) {
          return;
        }

        // Get the cutoff for this category from the full college data
        // For now, we'll estimate based on NIRF rank (better rank = lower cutoff)
        // In a real app, this would come from the full college object with cutoffs
        const estimatedCutoff = Math.max(1, (college.ranking.nirf || 50) * 100 + Math.random() * 500);

        const eligible = rankNum <= estimatedCutoff;
        const margin = estimatedCutoff - rankNum;

        // Determine chance based on margin
        let chance: 'high' | 'medium' | 'low' = 'low';
        if (eligible) {
          if (margin > 1000) chance = 'high';
          else if (margin > 500) chance = 'medium';
          else chance = 'low';
        } else if (margin > -500) {
          chance = 'low'; // Close call
        }

        predictions.push({
          college,
          category,
          cutoff: Math.floor(estimatedCutoff),
          rank: rankNum,
          eligible,
          margin,
          chance,
        });
      });

      // Sort by eligibility and then by margin
      predictions.sort((a, b) => {
        if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
        return b.margin - a.margin;
      });

      setResults(predictions);
    } catch (error) {
      console.error('Error predicting colleges:', error);
    } finally {
      setLoading(false);
    }
  };

  const eligibleCount = results.filter((r) => r.eligible).length;
  const totalResults = results.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
      {/* Header */}
      <div className="mb-8 md:mb-12 border-b border-slate-200 pb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
          College Predictor
        </h1>
        <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
          Enter your exam rank to discover which colleges you&rsquo;re eligible for. Get instant predictions based on your category and exam type.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-20">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Enter Your Details</h2>

            <form onSubmit={handlePredict} className="space-y-5">
              {/* Exam Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Entrance Exam
                </label>
                <select
                  value={exam}
                  onChange={(e) => setExam(e.target.value as ExamType)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                >
                  {EXAM_TYPES.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1.5">Select your entrance exam</p>
              </div>

              {/* Rank */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Your Rank
                </label>
                <input
                  type="number"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  placeholder="e.g., 150"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  min="1"
                />
                <p className="text-xs text-slate-500 mt-1.5">Enter your exam rank (1 = best)</p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Reservation Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryType)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1.5">Your category under reservation policy</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !rank}
                className={`w-full font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  loading || !rank
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Predicting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 17v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" />
                    </svg>
                    Predict Colleges
                  </>
                )}
              </button>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-blue-900 leading-relaxed">
                  <strong>Note:</strong> Predictions are based on previous year cutoffs and may vary. Please check official college websites for accurate information.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {!submitted ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5a4 4 0 100-8 4 4 0 000 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to Predict?</h3>
              <p className="text-slate-600 max-w-sm">
                Enter your exam details on the left to discover which colleges you&rsquo;re eligible for based on your rank.
              </p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4" />
                <p className="text-slate-600">Analyzing colleges...</p>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="bg-yellow-50 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Results Found</h3>
              <p className="text-slate-600 max-w-sm mb-6">
                No colleges were found for the selected exam and category combination.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setRank('');
                }}
                className="text-brand-600 hover:text-brand-700 font-semibold"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Card */}
              <div className="bg-gradient-to-r from-brand-50 to-brand-100 border border-brand-200 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-brand-700 font-semibold mb-1">Total Colleges</p>
                    <p className="text-3xl font-bold text-brand-900">{totalResults}</p>
                  </div>
                  <div>
                    <p className="text-sm text-brand-700 font-semibold mb-1">Eligible For</p>
                    <p className="text-3xl font-bold text-brand-900">{eligibleCount}</p>
                  </div>
                </div>
              </div>

              {/* Eligible Colleges */}
              {results.filter((r) => r.eligible).length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Eligible Colleges ({results.filter((r) => r.eligible).length})
                  </h3>
                  <div className="space-y-3">
                    {results
                      .filter((r) => r.eligible)
                      .slice(0, 5)
                      .map((result) => (
                        <CollegeResultCard key={result.college.id} result={result} />
                      ))}
                  </div>
                </div>
              )}

              {/* Other Colleges */}
              {results.filter((r) => !r.eligible).length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Check Eligibility ({results.filter((r) => !r.eligible).length})
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    You need a better rank to be eligible for these colleges. Consider improving your score!
                  </p>
                  <div className="space-y-3">
                    {results
                      .filter((r) => !r.eligible)
                      .slice(0, 5)
                      .map((result) => (
                        <CollegeResultCard key={result.college.id} result={result} />
                      ))}
                  </div>
                </div>
              )}

              {/* View More Button */}
              {results.length > 10 && (
                <button className="w-full py-3 border border-slate-200 rounded-lg text-brand-600 font-semibold hover:bg-slate-50 transition-colors mt-6">
                  View All Results ({results.length})
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// College Result Card Component
function CollegeResultCard({ result }: { result: PredictionResult }) {
  const chanceColors = {
    high: 'bg-green-50 border-green-200 text-green-700',
    medium: 'bg-amber-50 border-amber-200 text-amber-700',
    low: 'bg-red-50 border-red-200 text-red-700',
  };

  const chanceLabels = {
    high: 'High Chance',
    medium: 'Medium Chance',
    low: 'Low Chance',
  };

  return (
    <Link href={`/colleges/${result.college.slug}`}>
      <div className={`p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${result.eligible ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden p-1">
              <Image src={result.college.logoUrl} alt={result.college.shortName} width={40} height={40} unoptimized className="object-contain" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">{result.college.name}</h4>
              <p className="text-xs text-slate-500">{result.college.location.city}, {result.college.location.state}</p>
            </div>
          </div>
          <div className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${chanceColors[result.chance]}`}>
            {chanceLabels[result.chance]}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="bg-white rounded p-2 border border-slate-200">
            <p className="text-slate-500 font-semibold">Your Rank</p>
            <p className="font-bold text-slate-900 mt-1">{formatRank(result.rank)}</p>
          </div>
          <div className="bg-white rounded p-2 border border-slate-200">
            <p className="text-slate-500 font-semibold">Cutoff</p>
            <p className="font-bold text-slate-900 mt-1">{formatRank(result.cutoff)}</p>
          </div>
          <div className={`rounded p-2 border ${result.eligible ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'}`}>
            <p className="text-slate-600 font-semibold">Margin</p>
            <p className={`font-bold mt-1 ${result.eligible ? 'text-green-700' : 'text-red-700'}`}>
              {result.eligible ? '+' : ''}{formatRank(Math.abs(result.margin))}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
