import Link from "next/link";
import { CollegeIdentity } from "@/components/colleges/CollegeIdentity";
import { Badge } from "@/components/ui/Badge";
import type { College } from "@/types";

export function CollegeHero({ college }: { college: College }) {
  return (
    <header className="relative overflow-hidden border-b border-slate-200 bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(37,99,235,.35),transparent_30%),radial-gradient(circle_at_85%_75%,rgba(6,182,212,.18),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <CollegeIdentity shortName={college.shortName} category={college.category} className="h-24 w-24 flex-none border border-white/20 text-xl shadow-xl" />

          <div className="flex-1">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/15">{college.type.toUpperCase()}</Badge>
              <Badge className={college.isVerified ? "border-emerald-300/30 bg-emerald-400/15 text-emerald-100" : "border-amber-300/30 bg-amber-400/15 text-amber-100"}>
                {college.isVerified ? "Verified profile" : "Reference profile"}
              </Badge>
            </div>
            <h1 className="max-w-4xl text-3xl font-black tracking-tight md:text-5xl">{college.name}</h1>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300 md:text-base">
              <span>{college.location.city}, {college.location.state}</span>
              <span>Established {college.established}</span>
              {college.ranking.nirf && <span>NIRF {college.ranking.year} · #{college.ranking.nirf}</span>}
            </div>
          </div>

          <div className="flex w-full gap-3 md:w-auto">
            <a href={college.website} target="_blank" rel="noreferrer" className="flex-1 rounded-xl bg-white px-5 py-3 text-center font-bold text-slate-900 transition hover:bg-blue-50 md:flex-none">
              Official website ↗
            </a>
            <Link href="/predictor" className="flex-1 rounded-xl border border-white/25 bg-white/5 px-5 py-3 text-center font-bold text-white transition hover:bg-white/10 md:flex-none">
              Check cutoff
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
