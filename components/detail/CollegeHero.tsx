import Image from 'next/image';
import type { College } from '@/types';
import { Badge } from '@/components/ui/Badge';

export function CollegeHero({ college }: { college: College }) {
  return (
    <div className="bg-white border-b border-slate-200">
      {/* Cover Image */}
      <div className="relative h-64 md:h-80 w-full bg-slate-900">
        <Image
          src={college.imageUrl}
          alt={`${college.name} campus`}
          fill
          className="object-cover opacity-80"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-16 pb-8">
        <div className="flex flex-col md:flex-row gap-6 md:items-end">
          {/* Logo */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-white bg-white overflow-hidden shadow-lg flex-shrink-0 relative z-10">
            <Image
              src={college.logoUrl}
              alt={`${college.shortName} logo`}
              fill
              className="object-contain p-2"
              unoptimized
            />
          </div>

          {/* Title & Info */}
          <div className="flex-1 pt-2 md:pt-0">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary" className="bg-brand-50 text-brand-700 hover:bg-brand-100 border-brand-100">
                {college.type.toUpperCase()}
              </Badge>
              {college.isVerified && (
                <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border-green-100">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              {college.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-slate-600 text-sm md:text-base">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {college.location.city}, {college.location.state}
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-1.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold text-slate-900 mr-1">{college.rating}</span>
                ({college.reviewCount} Reviews)
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 md:w-auto w-full mt-4 md:mt-0">
            <button className="flex-1 md:flex-none bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm">
              Apply Now
            </button>
            <button className="flex-1 md:flex-none bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-3 px-6 rounded-xl transition-colors shadow-sm">
              Download Brochure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
