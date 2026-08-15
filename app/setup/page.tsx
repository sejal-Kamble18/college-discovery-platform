import Link from "next/link";

const firebaseValues = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

export const metadata = {
  title: "Deployment Setup",
  description: "Configure Firebase and optional live college data for EduDiscover.",
};

export default function SetupPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-bold text-brand-700">← Back to EduDiscover</Link>
        <h1 className="mt-6 text-4xl font-extrabold text-slate-900">Deployment setup</h1>
        <p className="mt-3 text-lg leading-8 text-slate-600">
          Public browsing and cutoff matching work without an account. Firebase is required for sign-in, saved colleges, and community posts.
        </p>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">Fix “auth/invalid-api-key”</h2>
          <ol className="mt-5 list-decimal space-y-3 pl-5 text-slate-700">
            <li>Open Firebase Console, select your project, then open Project settings.</li>
            <li>Under Your apps, create or select a Web app and copy its configuration values.</li>
            <li>Copy <code className="rounded bg-slate-100 px-1.5 py-0.5">.env.example</code> to <code className="rounded bg-slate-100 px-1.5 py-0.5">.env.local</code>.</li>
            <li>Paste the exact values below. Do not use placeholder text, quotes, or a service-account private key.</li>
            <li>In Authentication, enable Email/Password and Google and select a support email.</li>
            <li>Add localhost, the production hostname, and one stable staging hostname to Authentication → Settings → Authorized domains.</li>
            <li>In Vercel, add the complete configuration to both Preview and Production. Keep every value in an environment from the same Firebase Web app.</li>
            <li>Restart the Next.js development server after changing environment variables.</li>
          </ol>
          <div className="mt-6 rounded-xl bg-slate-950 p-5 font-mono text-xs leading-6 text-slate-200 sm:text-sm">
            {firebaseValues.map((value) => <div key={value}>{value}=</div>)}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">Live college search</h2>
          <p className="mt-3 leading-7 text-slate-600">
            Basic live results use attributed Wikipedia summaries and require no key. For richer address, phone, rating, website, and map details, enable Places API (New) in Google Cloud and add a server-only <code className="rounded bg-slate-100 px-1.5 py-0.5">GOOGLE_PLACES_API_KEY</code>. Never prefix that key with <code className="rounded bg-slate-100 px-1.5 py-0.5">NEXT_PUBLIC_</code>.
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/colleges" className="rounded-lg bg-brand-600 px-5 py-3 font-bold text-white">Open college search</Link>
          <a href="https://github.com/sejal-Kamble18/college-discovery-platform" target="_blank" rel="noreferrer" className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700">View repository</a>
        </div>
      </div>
    </main>
  );
}
