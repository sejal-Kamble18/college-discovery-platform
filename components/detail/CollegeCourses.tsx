import type { College } from '@/types';

export function CollegeCourses({ college }: { college: College }) {
  if (!college.courses || college.courses.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
      <div className="p-6 border-b border-slate-200 bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-900">Courses & Fees</h2>
        <p className="text-slate-500 mt-1">Detailed information about programs offered.</p>
      </div>

      <div className="divide-y divide-slate-100">
        {college.courses.map((course) => (
          <div key={course.id} className="p-6 hover:bg-slate-50 transition-colors">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{course.name}</h3>
                <div className="flex items-center gap-3 text-sm text-slate-600 mb-4">
                  <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700">{course.degree}</span>
                  <span>•</span>
                  <span>{course.duration} Years</span>
                  <span>•</span>
                  <span className="text-brand-600 font-medium">Eligibility: {course.eligibility}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">General Seats</span>
                    <span className="font-medium text-slate-900">{course.seats.general}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">OBC Seats</span>
                    <span className="font-medium text-slate-900">{course.seats.obc}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">SC/ST Seats</span>
                    <span className="font-medium text-slate-900">{course.seats.sc + course.seats.st}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1 mt-1">
                    <span className="text-slate-700 font-semibold">Total Intake</span>
                    <span className="font-bold text-brand-600">{course.seats.total}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-brand-50 rounded-xl p-4 md:text-right flex flex-row md:flex-col items-center md:items-end justify-between md:min-w-[160px]">
                <div>
                  <p className="text-sm text-brand-600 font-medium mb-1">First Year Fees</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ₹{(course.feesPerYear / 100000).toFixed(2)}L
                  </p>
                </div>
                <button className="text-brand-600 font-bold text-sm hover:underline mt-2">
                  View Structure
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
