export default function MarketPage() {
  const pairs = [
    {
      id: "1",
      pair: "STUD / SepETH",
      price: "0.0021",
      liquidity: "12,500",
      reserves: "10,000 STUD / 21 SepETH",
      creator: "0x12ab...89ef",
      status: "Active",
    },
    {
      id: "2",
      pair: "MATH / STUD",
      price: "4.50",
      liquidity: "8,200",
      reserves: "3,000 MATH / 13,500 STUD",
      creator: "0x45cd...23aa",
      status: "Experimental",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold">Market</h1>
          <p className="text-slate-300 max-w-3xl">
            Explore available trading pairs, view indicative prices from pool
            reserves, and navigate to swap or liquidity actions.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder="Search pair or token..."
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none"
          />
          <select className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none">
            <option>All statuses</option>
            <option>Active</option>
            <option>Experimental</option>
          </select>
          <select className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none">
            <option>Sort: Newest</option>
            <option>Sort: Liquidity</option>
            <option>Sort: Price</option>
          </select>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-800/70 text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left">Pair</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Liquidity</th>
                  <th className="px-4 py-3 text-left">Reserves</th>
                  <th className="px-4 py-3 text-left">Creator</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pairs.map((pair) => (
                  <tr
                    key={pair.id}
                    className="border-t border-slate-800 text-slate-200"
                  >
                    <td className="px-4 py-4 font-medium">{pair.pair}</td>
                    <td className="px-4 py-4">{pair.price}</td>
                    <td className="px-4 py-4">{pair.liquidity}</td>
                    <td className="px-4 py-4">{pair.reserves}</td>
                    <td className="px-4 py-4">{pair.creator}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full border border-slate-600 px-3 py-1 text-xs">
                        {pair.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <a
                          href="/swap"
                          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500"
                        >
                          Swap
                        </a>
                        <a
                          href="/add-liquidity"
                          className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                        >
                          Add Liquidity
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pairs.length === 0 && (
            <div className="px-6 py-12 text-center text-slate-400">
              No pairs available yet.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
