import type { College } from '@/types';

export function CollegePlacements({ college }: { college: College }) {
  if (!college.placements || college.placements.length === 0) {
    return null;
  }

  const latestPlacement = college.placements.sort((a, b) => b.year - a.year)[0];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Placement Highlights</h2>
          <p className="text-slate-500 mt-1">Class of {latestPlacement.year}</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Placement Rate</p>
          <p className="text-2xl font-bold text-green-600">{latestPlacement.placementRate}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <p className="text-sm text-slate-500 font-medium mb-1">Average Package</p>
          <p className="text-2xl font-bold text-slate-900">₹{latestPlacement.averagePackage} LPA</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <p className="text-sm text-slate-500 font-medium mb-1">Median Package</p>
          <p className="text-2xl font-bold text-slate-900">₹{latestPlacement.medianPackage} LPA</p>
        </div>
        <div className="bg-brand-50 p-4 rounded-xl border border-brand-100">
          <p className="text-sm text-brand-700 font-medium mb-1">Highest Package</p>
          <p className="text-2xl font-bold text-brand-700">₹{latestPlacement.highestPackage} LPA</p>
        </div>
        
        {/* Mobile only placement rate */}
        <div className="sm:hidden bg-green-50 p-4 rounded-xl border border-green-100">
          <p className="text-sm text-green-700 font-medium mb-1">Placement Rate</p>
          <p className="text-2xl font-bold text-green-700">{latestPlacement.placementRate}%</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Top Recruiters</h3>
        <div className="flex flex-wrap gap-3">
          {latestPlacement.topRecruiters.map((company) => (
            <div 
              key={company} 
              className="flex items-center px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg text-sm font-semibold text-slate-700"
            >
              {company}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
