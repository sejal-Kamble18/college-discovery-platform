'use client';

import { useCompareStore } from '@/lib/store/useCompareStore';
import Link from 'next/link';
import Image from 'next/image';

export function CompareBar() {
  const { selectedColleges, removeCollege, clearCompare } = useCompareStore();

  if (selectedColleges.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 transform transition-transform duration-300 translate-y-0">
      <div className="max-w-5xl mx-auto bg-slate-900 rounded-2xl shadow-2xl p-4 flex flex-col sm:flex-row items-center justify-between border border-slate-700">
        
        <div className="flex items-center gap-4 mb-4 sm:mb-0 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <div className="flex items-center text-white mr-4">
            <span className="bg-brand-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mr-2">
              {selectedColleges.length}
            </span>
            <span className="font-semibold whitespace-nowrap">Compare Colleges</span>
          </div>
          
          {selectedColleges.map((college) => (
            <div key={college.id} className="relative bg-slate-800 rounded-lg p-2 pr-8 flex items-center gap-3 border border-slate-700 min-w-[200px]">
              <div className="w-8 h-8 relative rounded bg-white overflow-hidden flex-shrink-0">
                <Image src={college.logoUrl} alt={college.shortName} fill className="object-contain p-1" unoptimized />
              </div>
              <p className="text-sm text-slate-200 font-medium truncate">{college.shortName}</p>
              <button 
                onClick={() => removeCollege(college.id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                aria-label="Remove"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {/* Placeholders for remaining slots */}
          {Array.from({ length: Math.max(0, 3 - selectedColleges.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="border border-dashed border-slate-600 rounded-lg p-2 min-w-[200px] h-[50px] flex items-center justify-center text-slate-500 text-sm font-medium">
              Add College
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={clearCompare}
            className="text-slate-400 hover:text-white text-sm font-medium px-2 py-2 whitespace-nowrap"
          >
            Clear All
          </button>
          <Link 
            href="/compare"
            className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm whitespace-nowrap flex-1 sm:flex-none text-center"
          >
            Compare Now
          </Link>
        </div>
      </div>
    </div>
  );
}
