import Link from "next/link";
import type { College } from "@/types";

export function CollegeReviews({ college }: { college: College }) {
  return (
    <section id="reviews" className="scroll-mt-24 mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Student Reviews</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            EduDiscover does not publish generated testimonials. Reviews will appear here only after authenticated submissions and moderation are enabled for {college.shortName}.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">No verified reviews yet</span>
      </div>
      <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <p className="font-semibold text-slate-800">Have a question about this institution?</p>
        <Link href="/discussions" className="mt-3 inline-flex text-sm font-bold text-brand-700 hover:text-brand-800">Ask the student community →</Link>
      </div>
    </section>
  );
}
