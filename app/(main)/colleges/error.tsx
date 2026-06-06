'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';

export default function CollegesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, you would log this to Sentry, Datadog, etc.
    console.error('Colleges listing error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center w-full">
      <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mb-6 border border-red-100 shadow-sm">
        <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Something went wrong</h2>
      
      <p className="text-slate-600 mb-8 max-w-md leading-relaxed">
        We encountered an error while fetching the colleges. This could be due to a temporary network issue or an invalid filter parameter.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Attempt to recover by re-rendering the segment */}
        <button
          onClick={() => reset()}
          className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-3 rounded-xl shadow-sm transition-colors"
        >
          Try again
        </button>
        {/* Safe fallback to clear URL state completely */}
        <Link 
          href="/colleges"
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-8 py-3 rounded-xl shadow-sm transition-colors"
        >
          Reset Filters
        </Link>
      </div>
    </div>
  );
}
