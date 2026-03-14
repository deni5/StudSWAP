export default function SwapPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold">Swap</h1>
          <p className="text-slate-300">
            Exchange available student tokens and SepETH-based assets using the
            platform swap interface.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm text-slate-300">From</label>
            <div className="grid gap-3 md:grid-cols-[1fr_180px]">
              <input
                type="number"
                placeholder="0.0"
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
              />
              <select className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none">
                <option>STUD</option>
                <option>SepETH</option>
                <option>MATH</option>
              </select>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="rounded-full border border-slate-700 px-4 py-2 text-slate-300">
              ↓
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">To</label>
            <div className="grid gap-3 md:grid-cols-[1fr_180px]">
              <input
                type="number"
                placeholder="Estimated output"
                disabled
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-400 outline-none"
              />
              <select className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none">
                <option>SepETH</option>
                <option>STUD</option>
                <option>MATH</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Quote</p>
              <p className="mt-2 text-lg font-semibold">1 STUD = 0.0021 SepETH</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Slippage</p>
              <input
                type="number"
                defaultValue="0.5"
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300 space-y-2">
            <p>Route: STUD → SepETH</p>
            <p>Price impact: 0.12%</p>
            <p>Minimum received: 0.0209 SepETH</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              disabled
              className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white opacity-60"
            >
              Swap
            </button>
            <a
              href="/market"
              className="rounded-xl border border-slate-600 px-5 py-3 font-medium text-white hover:bg-slate-800"
            >
              Back to Market
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
