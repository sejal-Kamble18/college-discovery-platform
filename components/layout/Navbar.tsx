"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthMenu } from "@/components/auth/AuthMenu";

const NAV_ITEMS = [
  { href: "/colleges", label: "Colleges" },
  { href: "/predictor", label: "Predictor" },
  { href: "/compare", label: "Compare" },
  { href: "/discussions", label: "Community" },
  { href: "/saved", label: "Saved" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <div className="rounded-lg bg-brand-600 p-1.5 text-white transition-colors group-hover:bg-brand-700">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Edu<span className="text-brand-600">Discover</span></span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-semibold text-slate-600 transition-colors hover:text-brand-600">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block"><AuthMenu /></div>
        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                {item.label}
              </Link>
            ))}
            <div className="mt-3 border-t border-slate-100 pt-3"><AuthMenu /></div>
          </nav>
        </div>
      )}
    </header>
  );
}
