

import Link from 'next/link';
import { getColleges } from '@/lib/firestore/colleges';
import { CollegeSearchBar } from '@/components/colleges/CollegeSearchBar';
import { CollegeFilters } from '@/components/colleges/CollegeFilters';
import { CollegeGrid } from '@/components/colleges/CollegeGrid';
import { LiveCollegeResults } from '@/components/colleges/LiveCollegeResults';
import type { SortField } from '@/types';

export default async function CollegesPage({
  searchParams,
}: {
  // In Next.js 16, searchParams is explicitly a Promise
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // 1. Await the params (Next.js 16 breaking change convention)
  const resolvedParams = await searchParams;

  // 2. Safely parse URL params
  const query = typeof resolvedParams.query === 'string' ? resolvedParams.query : '';
  const state = typeof resolvedParams.state === 'string' ? resolvedParams.state : '';
  const type = typeof resolvedParams.type === 'string' ? resolvedParams.type : '';
  const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : '';
  const exam = typeof resolvedParams.exam === 'string' ? resolvedParams.exam : '';
  const sortByParam = typeof resolvedParams.sortBy === 'string' ? resolvedParams.sortBy : 'ranking';
  const validSortFields: SortField[] = ['ranking', 'fees', 'rating', 'name', 'established'];
  const sortBy = validSortFields.includes(sortByParam as SortField) ? sortByParam as SortField : 'ranking';
  const sortOrder = sortBy === 'rating' ? 'desc' : 'asc';
  const maxFeesStr = typeof resolvedParams.maxFees === 'string' ? resolvedParams.maxFees : '';
  const minRatingStr = typeof resolvedParams.minRating === 'string' ? resolvedParams.minRating : '';
  const pageStr = typeof resolvedParams.page === 'string' ? resolvedParams.page : '1';

  const maxFees = maxFeesStr ? parseInt(maxFeesStr, 10) : undefined;
  const minRating = minRatingStr ? parseFloat(minRatingStr) : undefined;
  const page = parseInt(pageStr, 10) || 1;

  // 3. Fetch data securely from the service layer
  const { colleges, total, page: currentPage, totalPages } = await getColleges({
    query,
    state,
    type,
    category,
    exam,
    maxFees,
    minRating,
    sortBy,
    sortOrder,
    page,
  });

  const pageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(resolvedParams)) {
      if (typeof value === 'string' && key !== 'page') params.set(key, value);
    }
    params.set('page', String(nextPage));
    return `/colleges?${params.toString()}`;
  };

  // 4. Render UI
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
      {/* Header & Global Search */}
      <div className="mb-8 md:mb-12 border-b border-slate-200 pb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
          Explore Colleges
        </h1>
        <p className="text-slate-600 mb-6 text-lg max-w-3xl leading-relaxed">
          Browse {total > 0 ? `${total} loaded` : 'the available'} reference profiles, then use live search for more institutions across India. Verify academic facts before making a decision.
        </p>
        <div className="max-w-2xl">
          <CollegeSearchBar />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters (Sticky on Desktop) */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <CollegeFilters />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 pb-20">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 bg-white px-4 py-2 border border-slate-200 rounded-lg shadow-sm">
              Showing {colleges.length} {colleges.length === 1 ? 'Result' : 'Results'}
              {query && <span className="text-slate-500 font-normal"> for &quot;{query}&quot;</span>}
            </h2>
            {/* Optional Sorting Dropdown can go here in future iterations */}
          </div>
          
          <CollegeGrid colleges={colleges} />

          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4" aria-label="College result pages">
              {currentPage > 1 ? <Link href={pageHref(currentPage - 1)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">← Previous</Link> : <span />}
              <span className="text-sm font-semibold text-slate-500">Page {currentPage} of {totalPages}</span>
              {currentPage < totalPages ? <Link href={pageHref(currentPage + 1)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Next →</Link> : <span />}
            </nav>
          )}

          <LiveCollegeResults query={query} />
        </div>
      </div>
    </div>
  );
}
