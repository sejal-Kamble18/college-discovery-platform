

import Link from 'next/link';
import { getColleges } from '@/lib/firestore/colleges';
import { CollegeCard } from '@/components/colleges/CollegeCard';

export default async function HomePage() {
  // Fetch top 3 colleges natively on the server for the "Featured" section
  const { colleges: featuredColleges } = await getColleges({
    sortBy: 'rating',
    sortOrder: 'desc',
    page: 1
  });

  const topThree = featuredColleges.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 opacity-10">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Find Your <span className="text-brand-500">Dream College</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed">
            Discover, compare, and apply to India&rsquo;s top engineering, medical, and management institutes. Make informed decisions about your future.
          </p>

          {/* Visual CTA linking directly to our fully functional search page */}
          <div className="w-full max-w-2xl bg-white p-2 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-2">
            <Link href="/colleges" className="flex-1 relative flex items-center cursor-text">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="w-full h-12 pl-12 pr-4 flex items-center text-slate-400 bg-transparent">
                What do you want to study?
              </div>
            </Link>
            <Link
              href="/colleges"
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold h-12 px-8 rounded-xl flex items-center justify-center transition-colors w-full sm:w-auto shadow-sm"
            >
              Search
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-b border-slate-200 py-12 relative z-10 -mt-8 mx-4 sm:mx-8 max-w-5xl xl:mx-auto rounded-2xl shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
          <div className="text-center px-4">
            <p className="text-3xl md:text-4xl font-extrabold text-brand-600 mb-1">500+</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top Colleges</p>
          </div>
          <div className="text-center px-4">
            <p className="text-3xl md:text-4xl font-extrabold text-brand-600 mb-1">50k+</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admissions</p>
          </div>
          <div className="text-center px-4">
            <p className="text-3xl md:text-4xl font-extrabold text-brand-600 mb-1">10k+</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reviews</p>
          </div>
          <div className="text-center px-4">
            <p className="text-3xl md:text-4xl font-extrabold text-brand-600 mb-1">100%</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Data</p>
          </div>
        </div>
      </section>

      {/* Featured Colleges Section */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Featured Colleges</h2>
              <p className="text-slate-600 max-w-2xl">Discover top-rated institutions across India, chosen based on student reviews, placement records, and NIRF rankings.</p>
            </div>
            <Link href="/colleges" className="hidden md:flex items-center text-brand-600 font-bold hover:text-brand-700 transition-colors bg-brand-50 px-4 py-2 rounded-lg">
              View All
              <svg className="w-4 h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topThree.map((college) => (
              <CollegeCard key={college.id} college={college} />
            ))}
          </div>

          <div className="mt-10 text-center md:hidden">
            <Link href="/colleges" className="inline-flex items-center justify-center w-full px-6 py-3.5 bg-brand-50 text-brand-700 font-bold rounded-xl hover:bg-brand-100 transition-colors">
              View All Colleges
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
