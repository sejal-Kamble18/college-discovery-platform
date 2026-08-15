

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
      <section className="relative overflow-hidden bg-slate-950 py-20 text-white lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(37,99,235,0.32),transparent_32%),radial-gradient(circle_at_85%_75%,rgba(6,182,212,0.18),transparent_28%)]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:48px_48px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="mb-6 rounded-full border border-blue-400/25 bg-blue-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
            College decisions, made clearer
          </div>
          <h1 className="mb-6 max-w-4xl text-4xl font-black tracking-tight md:text-5xl lg:text-7xl">
            Find your <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Dream college</span>
          </h1>
          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-slate-300 md:text-xl">
            Search institutions across India, compare the facts that matter, and check your exam result against clearly labelled reference cutoffs.
          </p>

          <form action="/colleges" method="get" className="flex w-full max-w-3xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl shadow-blue-950/30 sm:flex-row">
            <label htmlFor="hero-college-search" className="sr-only">Search by college, course, exam, or city</label>
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="hero-college-search"
                name="query"
                type="search"
                autoComplete="off"
                placeholder="College, course, exam, or city"
                className="h-12 w-full rounded-xl bg-white pl-12 pr-4 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center rounded-xl bg-brand-600 px-8 font-bold text-white shadow-sm transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-blue-300 sm:w-auto"
            >
              Search colleges
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-300">
            <span className="mr-1 text-slate-400">Popular:</span>
            {['JEE Advanced', 'MBBS', 'MBA', 'Pune'].map((query) => (
              <Link key={query} href={`/colleges?query=${encodeURIComponent(query)}`} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-semibold transition hover:border-white/30 hover:bg-white/10">
                {query}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-4 -mt-8 max-w-6xl rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70 sm:mx-8 sm:p-6 xl:mx-auto">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['01', 'Discover', 'Search the live India-wide directory by name or state.'],
            ['02', 'Verify', 'Know which results are directory-only and which have decision data.'],
            ['03', 'Compare', 'Review sourced fees, rankings, and key facts side by side.'],
            ['04', 'Plan', 'Build likely, possible, and reach ranges from cutoff records.'],
          ].map(([number, title, copy]) => (
            <div key={number} className="rounded-xl px-4 py-4 transition-colors hover:bg-slate-50">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-xs font-black text-brand-700">{number}</span>
                <h2 className="font-extrabold text-slate-900">{title}</h2>
              </div>
              <p className="text-sm leading-6 text-slate-600">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-brand-700">Clear data labels</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Search broadly. Decide with verified facts.</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">A college name in a public directory is useful for discovery, but it is not enough for an admission decision. EduDiscover keeps those two levels visibly separate.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <InfoCard number="01" title="Live directory" copy="Find institutions across every Indian state and union territory without saving the search result to your account." link="/colleges" linkLabel="Search the directory" />
            <InfoCard number="02" title="Decision profiles" copy="Use saved profiles only when fees, courses, rankings and source status are clearly labelled." link="/compare" linkLabel="Compare profiles" />
            <InfoCard number="03" title="Cutoff evidence" copy="Filter versioned cutoff records by category, course, quota, round and year—without invented probabilities." link="/predictor" linkLabel="Open predictor" />
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-14 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-300">EduDiscover Pro</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Turn cutoff results into an admission strategy.</h2>
            <p className="mt-4 text-base leading-7 text-slate-300">Keep nationwide discovery free, then upgrade for advanced course, quota, state and year filters, saved predictor scenarios, and CSV exports.</p>
          </div>
          <Link href="/pricing" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-white px-6 py-3 font-black text-slate-950 transition hover:bg-blue-50">View plans →</Link>
        </div>
      </section>

      {/* Featured Colleges Section */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-3">Reference Profiles</h2>
              <p className="text-slate-600 max-w-2xl">Explore directory profiles and clearly labelled reference data. Confirm admissions information with official sources before deciding.</p>
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

function InfoCard({ number, title, copy, link, linkLabel }: { number: string; title: string; copy: string; link: string; linkLabel: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <span className="text-sm font-black text-brand-700">{number}</span>
      <h3 className="mt-4 text-xl font-extrabold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{copy}</p>
      <Link href={link} className="mt-6 inline-flex text-sm font-bold text-brand-700 hover:text-brand-800">{linkLabel} →</Link>
    </article>
  );
}
