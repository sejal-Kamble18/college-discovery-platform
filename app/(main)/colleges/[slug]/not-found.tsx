import Link from 'next/link';

export default function CollegeNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      </div>
      
      <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">College Not Found</h2>
      
      <p className="text-lg text-slate-600 mb-8 max-w-md leading-relaxed">
        We couldn&rsquo;t find the college you were looking for. The link may be broken or the college might have been removed.
      </p>
      
      <Link 
        href="/colleges"
        className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-sm transition-colors"
      >
        Browse All Colleges
      </Link>
    </div>
  );
}
