export default function CollegeDetailLoading() {
  return (
    <div className="bg-slate-50 min-h-screen pb-20 animate-pulse">
      {/* Hero Skeleton */}
      <div className="bg-white border-b border-slate-200">
        <div className="relative h-64 md:h-80 w-full bg-slate-200" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-16 pb-8">
          <div className="flex flex-col md:flex-row gap-6 md:items-end">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-white bg-slate-200 flex-shrink-0 relative z-10" />
            <div className="flex-1 pt-2 md:pt-0">
              <div className="flex gap-2 mb-3">
                <div className="h-6 w-24 bg-slate-200 rounded-full" />
                <div className="h-6 w-20 bg-slate-200 rounded-full" />
              </div>
              <div className="h-10 w-3/4 bg-slate-200 rounded-lg mb-4" />
              <div className="flex gap-4">
                <div className="h-5 w-32 bg-slate-200 rounded" />
                <div className="h-5 w-40 bg-slate-200 rounded" />
              </div>
            </div>
            <div className="flex gap-3 md:w-auto w-full mt-4 md:mt-0">
              <div className="h-12 w-32 bg-slate-200 rounded-xl" />
              <div className="h-12 w-48 bg-slate-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 w-full lg:w-2/3 space-y-8">
            <div className="h-48 bg-white rounded-2xl border border-slate-200 p-6">
              <div className="h-6 w-48 bg-slate-200 rounded mb-6" />
              <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-16 bg-slate-200 rounded" />
                    <div className="h-6 w-24 bg-slate-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
            <div className="h-96 bg-white rounded-2xl border border-slate-200" />
          </div>
          <div className="w-full lg:w-1/3 flex-shrink-0">
            <div className="h-80 bg-white rounded-2xl border border-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
