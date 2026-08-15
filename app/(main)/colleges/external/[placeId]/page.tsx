import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CollegeProviderError,
  getGoogleCollege,
  isGooglePlacesConfigured,
} from "@/lib/college-providers/google-places";

export const dynamic = "force-dynamic";

export default async function ExternalCollegePage({
  params,
}: {
  params: Promise<{ placeId: string }>;
}) {
  const { placeId } = await params;

  if (!isGooglePlacesConfigured()) {
    return <ProviderUnavailable />;
  }

  let college: Awaited<ReturnType<typeof getGoogleCollege>>;
  try {
    college = await getGoogleCollege(placeId);
  } catch (error) {
    if (error instanceof CollegeProviderError) {
      return <ProviderUnavailable message={error.message} />;
    }
    throw error;
  }

  if (!college) notFound();

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Link href="/colleges" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
          ← Back to college search
        </Link>

        <article className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-900 px-6 py-8 text-white sm:px-10">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              Live external profile
            </span>
            <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">{college.name}</h1>
            <p className="mt-3 max-w-3xl text-slate-300">{college.formattedAddress}</p>
          </div>

          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section>
                <h2 className="text-xl font-bold text-slate-900">Directory information</h2>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Info label="City" value={college.city} />
                  <Info label="State" value={college.state} />
                  <Info label="Phone" value={college.phone} />
                  <Info
                    label="Public rating"
                    value={
                      college.rating !== undefined
                        ? `${college.rating.toFixed(1)} (${college.ratingCount || 0} ratings)`
                        : undefined
                    }
                  />
                </dl>
              </section>

              <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <h2 className="font-bold text-amber-950">Academic data not yet verified</h2>
                <p className="mt-2 text-sm leading-6 text-amber-900">
                  Fees, courses, cutoffs, placements, accreditation and admission probability are not supplied by the live directory. Verify them on the institution website or an official counselling source.
                </p>
              </section>
            </div>

            <aside className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="font-bold text-slate-900">Official links</h2>
              <div className="mt-4 space-y-3">
                {college.website && (
                  <a href={college.website} target="_blank" rel="noreferrer" className="block rounded-lg bg-brand-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-brand-700">
                    Visit institution website
                  </a>
                )}
                {college.googleMapsUrl && (
                  <a href={college.googleMapsUrl} target="_blank" rel="noreferrer" className="block rounded-lg border border-slate-300 bg-white px-4 py-3 text-center text-sm font-bold text-slate-700 hover:bg-slate-100">
                    Open map listing
                  </a>
                )}
              </div>
              <p className="mt-5 text-xs leading-5 text-slate-500">
                Retrieved live from Google Places. EduDiscover does not store this institution profile.
              </p>
            </aside>
          </div>
        </article>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-900">{value || "Not available"}</dd>
    </div>
  );
}

function ProviderUnavailable({ message }: { message?: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-slate-900">Live profile unavailable</h1>
      <p className="mt-3 text-slate-600">{message || "Live college search is not configured for this deployment."}</p>
      <Link href="/colleges" className="mt-6 inline-flex rounded-lg bg-brand-600 px-5 py-3 font-bold text-white">
        Return to search
      </Link>
    </div>
  );
}
