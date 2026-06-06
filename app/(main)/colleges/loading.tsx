export default function CollegesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8 md:mb-12 border-b border-slate-200 pb-8">
        <div className="h-10 bg-slate-200 rounded-lg w-64 mb-4" />
        <div className="h-6 bg-slate-200 rounded-lg w-full max-w-2xl mb-6" />
        <div className="max-w-2xl h-14 bg-slate-200 rounded-xl" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Skeleton */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="h-[600px] bg-slate-200 rounded-xl border border-slate-200" />
        </div>

        {/* Grid Skeleton */}
        <div className="flex-1 min-w-0">
          {/* Results count skeleton */}
          <div className="h-10 bg-slate-200 rounded-lg w-32 mb-6" />
          
          {/* 6 Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm h-[380px]">
                <div className="h-40 bg-slate-200 w-full" />
                <div className="p-5 flex-grow space-y-4">
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="flex gap-2 mt-4">
                    <div className="h-6 bg-slate-200 rounded w-16" />
                    <div className="h-6 bg-slate-200 rounded w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
