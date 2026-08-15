export default function CollegesLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse px-4 py-8 sm:px-6 md:py-12 lg:px-8">
      <div className="mb-10 border-b border-slate-200 pb-8">
        <div className="mb-4 h-10 w-64 rounded-lg bg-slate-200" />
        <div className="mb-6 h-6 w-full max-w-2xl rounded-lg bg-slate-200" />
        <div className="h-14 max-w-2xl rounded-xl bg-slate-200" />
      </div>

      <div className="mb-10 rounded-2xl border border-blue-100 bg-blue-50 p-7">
        <div className="h-4 w-36 rounded bg-blue-200" />
        <div className="mt-3 h-8 w-72 rounded bg-blue-100" />
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {[1, 2, 3, 4].map((item) => <div key={item} className="h-32 rounded-xl bg-white" />)}
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="h-[600px] w-full flex-shrink-0 rounded-xl border border-slate-200 bg-slate-200 lg:w-72" />
        <div className="min-w-0 flex-1">
          <div className="mb-6 h-10 w-48 rounded-lg bg-slate-200" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-[390px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex justify-between">
                  <div className="h-12 w-12 rounded-xl bg-slate-200" />
                  <div className="h-6 w-28 rounded-full bg-slate-100" />
                </div>
                <div className="mt-6 h-7 w-4/5 rounded bg-slate-200" />
                <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />
                <div className="mt-6 h-20 rounded-xl bg-slate-100" />
                <div className="mt-5 flex gap-2">
                  <div className="h-6 w-20 rounded bg-slate-100" />
                  <div className="h-6 w-24 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
