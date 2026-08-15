import Link from "next/link";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <Link href="/" className="text-sm font-bold text-brand-700">← Back to EduDiscover</Link>
        <h1 className="mt-6 text-4xl font-extrabold text-slate-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: 15 August 2026</p>
        <div className="mt-8 space-y-7 leading-7 text-slate-700">
          <Section title="Research tool, not counselling">EduDiscover is an informational research tool. College data, rankings, fees, placements, cutoffs, ratings, and predictions may be incomplete, delayed, or reference-only. Always verify information with the institution and the relevant official admission or counselling authority.</Section>
          <Section title="Predictions">The predictor performs a deterministic comparison against stored cutoff references. It does not account for every course, round, quota, domicile rule, tie-break, or policy change and does not guarantee admission.</Section>
          <Section title="Accounts and community content">You are responsible for your account and for content you submit. Do not post unlawful, deceptive, abusive, private, or infringing material. The operator may remove content or restrict access to protect users and the service.</Section>
          <Section title="Third-party services">The application may link to institutions and use Firebase, Google Places, or Wikimedia services. Those services have separate terms and privacy practices, and EduDiscover does not control their content or availability.</Section>
          <Section title="Availability and liability">The service is provided without a promise of uninterrupted availability or error-free data. To the extent permitted by applicable law, the operator is not responsible for admission, financial, academic, or other decisions made from the service.</Section>
          <Section title="Changes">The operator may update these terms as the service develops. Continued use after an updated version is published means you accept the revised terms.</Section>
        </div>
        <p className="mt-8 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">Before commercial launch, the operator should have these terms reviewed for its legal entity, jurisdiction, contact details, and applicable education and consumer-protection laws.</p>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="text-xl font-bold text-slate-900">{title}</h2><p className="mt-2">{children}</p></section>;
}
