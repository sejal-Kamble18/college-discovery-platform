export default function CollegeDetailLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-slate-50 pb-20">
      <div className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div className="h-24 w-24 flex-none rounded-xl bg-slate-800" />
          <div className="flex-1">
            <div className="mb-4 flex gap-2">
              <div className="h-6 w-24 rounded-full bg-slate-800" />
              <div className="h-6 w-28 rounded-full bg-slate-800" />
            </div>
            <div className="h-10 w-full max-w-2xl rounded-lg bg-slate-800" />
            <div className="mt-4 flex gap-4">
              <div className="h-5 w-32 rounded bg-slate-800" />
              <div className="h-5 w-36 rounded bg-slate-800" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-12 w-36 rounded-xl bg-slate-800" />
            <div className="h-12 w-32 rounded-xl bg-slate-800" />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="w-full flex-1 space-y-8 lg:w-2/3">
            <div className="h-48 rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-6 h-6 w-48 rounded bg-slate-200" />
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                {[1, 2, 3, 4].map((item) => <div key={item} className="h-16 rounded-lg bg-slate-100" />)}
              </div>
            </div>
            <div className="h-96 rounded-2xl border border-slate-200 bg-white" />
          </div>
          <div className="h-80 w-full rounded-2xl border border-slate-200 bg-white lg:w-1/3" />
        </div>
      </div>
    </div>
  );
}
