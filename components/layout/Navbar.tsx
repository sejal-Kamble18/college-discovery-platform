import Link from 'next/link';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-brand-600 text-white p-1.5 rounded-lg group-hover:bg-brand-700 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            Edu<span className="text-brand-600">Discover</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/colleges" className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors">
            Colleges
          </Link>
          <Link href="/predictor" className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors">
            Predictor
          </Link>
          <Link href="/compare" className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors">
            Compare
          </Link>
          <Link href="/discussions" className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition-colors">
            Q&A
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <Link 
              href="/saved" 
              className="text-sm font-semibold text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
              </svg>
              Saved
            </Link>
            <Link 
              href="/auth/login" 
              className="text-sm font-semibold text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/auth/signup" 
              className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors"
            >
              Sign Up
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
