import Link from 'next/link';
import type { College } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { CollegeMedia } from '@/components/media/CollegeMedia';

export function CollegeHero({ college }: { college: College }) {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="relative h-52 w-full bg-slate-900 md:h-64">
        <CollegeMedia
          src={college.imageUrl}
          alt={college.isVerified ? `${college.name} campus` : ''}
          shortName={college.shortName}
          category={college.category}
          variant="cover"
          className="h-full w-full"
          imageClassName="opacity-75"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
      </div>

      <div className="relative mx-auto -mt-12 max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end">
          <CollegeMedia
              src={college.logoUrl}
              alt={`${college.shortName} logo`}
              shortName={college.shortName}
              category={college.category}
              variant="logo"
              className="relative z-10 h-28 w-28 flex-shrink-0 rounded-2xl border-4 border-white bg-white shadow-lg md:h-32 md:w-32"
          />

          <div className="flex-1 pt-1 md:pt-0">
            <div className="mb-3 flex flex-wrap gap-2">
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
            
            <h1 className="mb-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              {college.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600 md:text-base">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {college.location.city}, {college.location.state}
              </div>
              {college.ranking.nirf && (
                <div className="flex items-center font-semibold text-slate-700">
                  NIRF {college.ranking.year} · #{college.ranking.nirf}
                </div>
              )}
              {college.isVerified && <div className="flex items-center">
                <svg className="w-5 h-5 mr-1.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold text-slate-900 mr-1">{college.rating}</span>
                ({college.reviewCount} ratings)
              </div>}
            </div>
          </div>

          <div className="mt-2 flex w-full gap-3 md:mt-0 md:w-auto">
            <a href={college.website} target="_blank" rel="noreferrer" className="flex-1 rounded-xl bg-brand-600 px-6 py-3 text-center font-bold text-white shadow-sm transition-colors hover:bg-brand-700 md:flex-none">
              Official website ↗
            </a>
            <Link href="/predictor" className="flex-1 rounded-xl border border-slate-200 bg-white px-6 py-3 text-center font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 md:flex-none">
              Check cutoff
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
