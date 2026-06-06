import type { College } from '@/types';

export function CollegeReviews({ college }: { college: College }) {
  // Static mock reviews for MVP based on college rating
  const mockReviews = [
    {
      id: 1,
      author: 'Rahul Verma',
      course: college.courses?.[0]?.name || 'B.Tech',
      year: '2023',
      rating: Math.min(5, college.rating + 0.2),
      title: 'Excellent academics and placement opportunities',
      content: `The faculty at ${college.shortName} is highly experienced and approachable. The curriculum is updated regularly to match industry standards. Placements are phenomenal, especially for CS and IT branches. The only downside is the highly competitive environment which can be stressful.`,
    },
    {
      id: 2,
      author: 'Priya Sharma',
      course: college.courses?.[0]?.name || 'MBA',
      year: '2022',
      rating: Math.max(1, college.rating - 0.4),
      title: 'Great infrastructure but hostel facilities need improvement',
      content: `Campus life is vibrant with numerous clubs and technical fests. The library is massive and labs are well-equipped. However, the hostel mess food is average and room allocation can be tricky in the first year. Overall, a solid return on investment considering the brand value.`,
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-8">
      <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Reviews</h2>
          <p className="text-slate-500 mt-1">Based on {college.reviewCount} verified reviews</p>
        </div>
        <div className="text-center bg-brand-50 rounded-xl px-6 py-3 border border-brand-100">
          <p className="text-3xl font-black text-brand-700">{college.rating.toFixed(1)}</p>
          <p className="text-xs font-bold text-brand-600 uppercase mt-1">Out of 5</p>
        </div>
      </div>

      <div className="space-y-6">
        {mockReviews.map((review) => (
          <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                  {review.author.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 leading-tight">{review.author}</p>
                  <p className="text-xs text-slate-500">{review.course} • Batch of {review.year}</p>
                </div>
              </div>
              <div className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded font-bold text-sm">
                {review.rating.toFixed(1)} <span className="text-green-500 ml-1">★</span>
              </div>
            </div>
            
            <h4 className="font-bold text-slate-800 mt-3 mb-2">{review.title}</h4>
            <p className="text-slate-600 text-sm leading-relaxed">{review.content}</p>
            
            <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-400">
              <button className="flex items-center hover:text-brand-600 transition-colors">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                Helpful
              </button>
              <button className="flex items-center hover:text-slate-600 transition-colors">
                Report
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <button className="text-brand-600 font-bold hover:bg-brand-50 px-6 py-2 rounded-lg transition-colors">
          Read All {college.reviewCount} Reviews
        </button>
      </div>
    </div>
  );
}
