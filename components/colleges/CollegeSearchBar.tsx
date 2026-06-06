'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export function CollegeSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize from URL
  const initialQuery = searchParams.get('query') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const isMounted = useRef(false);

  // Debounced URL update
  useEffect(() => {
    // Skip the first render to avoid unnecessary URL pushes
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (searchTerm.trim()) {
        params.set('query', searchTerm.trim());
      } else {
        params.delete('query');
      }

      // Always reset to page 1 when performing a new search
      params.set('page', '1');

      // Update URL without scrolling to top
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, 400); // 400ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, pathname, router, searchParams]);

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 sm:text-sm shadow-sm transition-all"
        placeholder="Search for colleges, exams, courses, or cities..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Clear Button */}
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
