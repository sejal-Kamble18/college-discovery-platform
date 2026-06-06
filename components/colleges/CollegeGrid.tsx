import type { CollegeListItem } from '@/types';
import { CollegeCard } from './CollegeCard';

interface CollegeGridProps {
  colleges: CollegeListItem[];
}

export function CollegeGrid({ colleges }: CollegeGridProps) {
  // Graceful empty state
  if (colleges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-xl border border-slate-200 border-dashed text-center">
        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">No colleges found</h3>
        <p className="text-slate-500 max-w-sm">
          We couldn&rsquo;t find any colleges matching your current filters. Try adjusting your search criteria or clearing the filters to see more results.
        </p>
      </div>
    );
  }

  // Responsive Grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {colleges.map((college) => (
        <CollegeCard key={college.id} college={college} />
      ))}
    </div>
  );
}
