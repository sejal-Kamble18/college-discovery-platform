import Link from 'next/link';

const topCollegeLinks = [
  { label: 'Top Engineering Colleges', href: '/colleges?category=engineering' },
  { label: 'Top Medical Colleges', href: '/colleges?category=medical' },
  { label: 'Top MBA Colleges', href: '/colleges?category=management' },
  { label: 'Top Law Colleges', href: '/colleges?category=law' },
  { label: 'Top Science Colleges', href: '/colleges?category=science' },
];

const quickLinks = [
  { label: 'Browse All Colleges', href: '/colleges' },
  { label: 'College Predictor', href: '/predictor' },
  { label: 'Compare Colleges', href: '/compare' },
  { label: 'Q&A Community', href: '/discussions' },
  { label: 'Saved Colleges', href: '/saved' },
];

const companyLinks = [
  { label: 'About Us', href: '#' },
  { label: 'Contact Support', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Careers', href: '#' },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="group inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/20 transition-colors group-hover:bg-brand-500">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3 1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3Zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9ZM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72Z" />
                </svg>
              </div>

              <span className="text-2xl font-black tracking-tight text-white">
                Edu<span className="text-brand-500">Discover</span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              Discover, compare, predict, and apply to colleges across India with
              reliable data, smart filters, and decision-first tools.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/colleges"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Browse Colleges
              </Link>
              <Link
                href="/predictor"
                className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-brand-500 hover:text-brand-400"
              >
                Try Predictor
              </Link>
            </div>
          </div>

          <FooterColumn title="Top Colleges" links={topCollegeLinks} />
          <FooterColumn title="Platform" links={quickLinks} />
          <FooterColumn title="Company" links={companyLinks} />
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6">
          <div className="flex flex-col gap-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>
              © {new Date().getFullYear()} EduDiscover. Built for smarter
              admission decisions.
            </p>

            <div className="flex flex-wrap gap-4">
              <span>10,000+ colleges</span>
              <span>•</span>
              <span>Search & compare</span>
              <span>•</span>
              <span>Firebase powered</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-white">
        {title}
      </h4>

      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-slate-400 transition hover:text-brand-400"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}