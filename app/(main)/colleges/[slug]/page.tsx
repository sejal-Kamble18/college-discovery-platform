import { notFound } from 'next/navigation';
import { getCollegeById, getColleges } from '@/lib/firestore/colleges';
import { CollegeHero } from '@/components/detail/CollegeHero';
import { CollegeStats } from '@/components/detail/CollegeStats';
import { CollegeCourses } from '@/components/detail/CollegeCourses';
import { CollegePlacements } from '@/components/detail/CollegePlacements';
import { CollegeReviews } from '@/components/detail/CollegeReviews';
import { RecentViewTracker } from '@/components/detail/RecentViewTracker';

// Generate static params for faster loading in production
export async function generateStaticParams() {
  const { colleges } = await getColleges({ page: 1, limit: 100 });
  return colleges.map((college) => ({
    slug: college.slug,
  }));
}

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
                <li><button className="text-brand-600 hover:text-brand-800 font-medium w-full text-left flex justify-between items-center">Admission Process <span className="text-slate-400">→</span></button></li>
                <li><button className="text-brand-600 hover:text-brand-800 font-medium w-full text-left flex justify-between items-center">Cutoffs 2025 <span className="text-slate-400">→</span></button></li>
                <li><button className="text-brand-600 hover:text-brand-800 font-medium w-full text-left flex justify-between items-center">Hostel & Facilities <span className="text-slate-400">→</span></button></li>
                <li><button className="text-brand-600 hover:text-brand-800 font-medium w-full text-left flex justify-between items-center">Scholarships <span className="text-slate-400">→</span></button></li>
              </ul>
              
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 mb-2">Need Help?</h3>
                <p className="text-sm text-slate-500 mb-4">Get personalized admission guidance from our experts.</p>
                <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl transition-colors">
                  Talk to Counselor
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
