import Link from "next/link";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <Link href="/" className="text-sm font-bold text-brand-700">← Back to EduDiscover</Link>
        <h1 className="mt-6 text-4xl font-extrabold text-slate-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: 16 August 2026</p>
        <div className="mt-8 space-y-7 leading-7 text-slate-700">
          <Section title="Information we process">When you create an account, Firebase Authentication processes your name, email address, profile image, authentication identifiers, and sign-in activity. Firestore stores your profile, saved colleges, and community posts.</Section>
          <Section title="How we use it">We use this information to authenticate you, synchronize your shortlist, display your chosen public profile name on posts, secure account-specific data, and operate the service.</Section>
          <Section title="College searches">Curated searches are handled by this application. Live search terms may be sent to Wikimedia or the configured Google Places provider. Live institution results are displayed on demand and are not written to Firestore by the application.</Section>
          <Section title="Payments and subscriptions">Stripe processes checkout, payment methods, invoices, and billing-portal activity. EduDiscover stores Stripe customer/subscription identifiers and subscription status in Firestore to grant Pro access; it does not receive or store complete card numbers.</Section>
          <Section title="Sharing and retention">Firebase, Stripe, Wikimedia, and the configured Google Places provider may process data needed to provide their services. We do not sell personal information. Account and billing records remain until deleted by the operator or retained for security, accounting, dispute, or legal obligations.</Section>
          <Section title="Your choices">You may use public browsing and the predictor without signing in. You can remove saved colleges individually. For account or post deletion, contact the project maintainer through the repository issue tracker.</Section>
          <Section title="Security and changes">Access is restricted through Firebase security rules, but no online service can guarantee absolute security. Material changes to this policy should be reflected on this page before deployment.</Section>
        </div>
        <p className="mt-8 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">This project policy must be reviewed and updated by the operator for the deployed business, jurisdiction, support address, and retention practices.</p>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="text-xl font-bold text-slate-900">{title}</h2><p className="mt-2">{children}</p></section>;
}
