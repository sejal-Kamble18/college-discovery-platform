'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { INDIAN_STATES } from '@/constants/filters';

const FEE_OPTIONS = [
  { label: 'Under ₹500,000', value: '500000' },
  { label: 'Under ₹1,000,000', value: '1000000' },
  { label: 'Under ₹2,000,000', value: '2000000' },
  { label: 'Under ₹3,000,000', value: '3000000' },
];

const RATING_OPTIONS = [
  { label: '4.5 & Above', value: '4.5' },
  { label: '4.0 & Above', value: '4.0' },
  { label: '3.5 & Above', value: '3.5' },
  { label: '3.0 & Above', value: '3.0' },
];

export function CollegeFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL state sync helper
  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Always reset pagination when filters change
    params.set('page', '1');
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const currentState = searchParams.get('state') || '';
  const currentMaxFees = searchParams.get('maxFees') || '';
  const currentMinRating = searchParams.get('minRating') || '';

  const clearAll = () => {
    // Keep search query if it exists, but clear all other filters
    const query = searchParams.get('query');
    if (query) {
      router.push(`${pathname}?query=${encodeURIComponent(query)}`, { scroll: false });
    } else {
      router.push(pathname, { scroll: false });
    }
  };

  const hasActiveFilters = currentState || currentMaxFees || currentMinRating;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-8 sticky top-24 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="font-bold text-lg text-slate-900">Filters</h3>
        {hasActiveFilters && (
          <button 
            onClick={clearAll}
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* State Filter */}
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-slate-900">Location (State)</h4>
        <select
          className="w-full border border-slate-200 rounded-lg py-2.5 px-3 text-sm focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none bg-white text-slate-700 transition-all shadow-sm"
          value={currentState}
          onChange={(e) => updateFilter('state', e.target.value)}
        >
          <option value="">All States (Pan India)</option>
          {INDIAN_STATES.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>

      {/* Fees Filter */}
      <div className="space-y-3 pt-2">
        <h4 className="font-semibold text-sm text-slate-900">Max Tuition Fees / Yr</h4>
        <div className="space-y-2.5">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="fees"
              value=""
              checked={currentMaxFees === ''}
              onChange={() => updateFilter('maxFees', null)}
              className="w-4 h-4 text-brand-600 border-slate-300 focus:ring-brand-500/50"
            />
            <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Any Fee</span>
          </label>
          {FEE_OPTIONS.map((range) => (
            <label key={range.label} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="fees"
                value={range.value}
                checked={currentMaxFees === range.value}
                onChange={(e) => updateFilter('maxFees', e.target.value)}
                className="w-4 h-4 text-brand-600 border-slate-300 focus:ring-brand-500/50"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="space-y-3 border-t border-slate-100 pt-6">
        <h4 className="font-semibold text-sm text-slate-900">User Rating</h4>
        <div className="space-y-2.5">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="rating"
              value=""
              checked={currentMinRating === ''}
              onChange={() => updateFilter('minRating', null)}
              className="w-4 h-4 text-brand-600 border-slate-300 focus:ring-brand-500/50"
            />
            <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">Any Rating</span>
          </label>
          {RATING_OPTIONS.map((option) => (
            <label key={option.label} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="rating"
                value={option.value}
                checked={currentMinRating === option.value}
                onChange={(e) => updateFilter('minRating', e.target.value)}
                className="w-4 h-4 text-brand-600 border-slate-300 focus:ring-brand-500/50"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-900 flex items-center transition-colors">
                <span className="text-amber-400 mr-1.5 text-base leading-none">★</span> {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
