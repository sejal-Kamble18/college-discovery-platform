import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCollegeById } from '@/lib/firestore/colleges';
import { CollegeHero } from '@/components/detail/CollegeHero';
import { CollegeStats } from '@/components/detail/CollegeStats';
import { CollegeCourses } from '@/components/detail/CollegeCourses';
import { CollegePlacements } from '@/components/detail/CollegePlacements';
import { CollegeReviews } from '@/components/detail/CollegeReviews';
import { RecentViewTracker } from '@/components/detail/RecentViewTracker';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const college = await getCollegeById(resolvedParams.slug);
  
  if (!college) return { title: 'Not Found' };
  
  return {
    title: `${college.name} - Admissions, Fees, Courses | College Discovery`,
    description: `Discover courses, fees, placements, and reviews for ${college.name} located in ${college.location.city}, ${college.location.state}.`,
  };
}

export default async function CollegeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const college = await getCollegeById(resolvedParams.slug);

  if (!college) {
    notFound();
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <RecentViewTracker college={college} />
      <CollegeHero college={college} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {!college.isVerified && (
          <div className="mb-8 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-amber-100 font-black" aria-hidden="true">i</span>
            <p><strong>Reference data.</strong> Fees, cutoffs, seats, placements, and deadlines can change. Confirm them on the institution and official counselling websites before applying.</p>
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content Area */}
          <div className="flex-1 w-full lg:w-2/3 min-w-0">
            <CollegeStats college={college} />
            <CollegeCourses college={college} />
            <CollegePlacements college={college} />
            <CollegeReviews college={college} />
          </div>
          
          {/* Sidebar / Quick Links */}
          <div className="w-full lg:w-1/3 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
              <h3 className="font-bold text-slate-900 mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li><a href="#overview" className="text-brand-600 hover:text-brand-800 font-medium w-full flex justify-between items-center">Overview & facilities <span className="text-slate-400">→</span></a></li>
                <li><a href="#courses" className="text-brand-600 hover:text-brand-800 font-medium w-full flex justify-between items-center">Courses & reference fees <span className="text-slate-400">→</span></a></li>
                <li><a href="#placements" className="text-brand-600 hover:text-brand-800 font-medium w-full flex justify-between items-center">Placement data <span className="text-slate-400">→</span></a></li>
                <li><Link href="/predictor" className="text-brand-600 hover:text-brand-800 font-medium w-full flex justify-between items-center">Cutoff matcher <span className="text-slate-400">→</span></Link></li>
              </ul>
              
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 mb-2">Verify before applying</h3>
                <p className="text-sm text-slate-500 mb-4">Use the institution website for current eligibility, deadlines, fees, and applications.</p>
                <a href={college.website} target="_blank" rel="noreferrer" className="block w-full bg-slate-900 hover:bg-slate-800 text-center text-white font-bold py-3 px-4 rounded-xl transition-colors">
                  Visit official website
                </a>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
