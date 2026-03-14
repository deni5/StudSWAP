export default function VaultPage() {
  const positions = [
    {
      id: "1",
      pair: "STUD / SepETH",
      lpLocked: "125.40 LP",
      receipt: "rSTUD-SEP-125",
      unlockDate: "2026-04-15",
      bonus: "0.015 SepETH",
      status: "Locked",
    },
    {
      id: "2",
      pair: "MATH / STUD",
      lpLocked: "80.00 LP",
      receipt: "rMATH-STUD-080",
      unlockDate: "2026-04-22",
      bonus: "150 STUD",
      status: "Redeemable Soon",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold">Vault</h1>
          <p className="text-slate-300 max-w-3xl">
            Lock LP positions, receive receipt tokens, and monitor unlock dates
            for future redemption with optional bonus payouts.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total Locked LP</p>
            <p className="mt-2 text-2xl font-semibold">205.40 LP</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Receipt Tokens</p>
            <p className="mt-2 text-2xl font-semibold">2 Positions</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Redeem Status</p>
            <p className="mt-2 text-2xl font-semibold">0 Redeemable</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Lock LP Position</h2>
              <p className="text-sm text-slate-400">
                Deposit LP tokens into the vault and receive a receipt token.
              </p>
            </div>
            <button
              disabled
              className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white opacity-60"
            >
              Stake LP
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <select className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none">
              <option>Select LP Pair</option>
              <option>STUD / SepETH</option>
              <option>MATH / STUD</option>
            </select>
            <input
              type="number"
              placeholder="LP amount"
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
            />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300 space-y-2">
            <p>Receipt token preview: rPAIR-LP</p>
            <p>Lock period: 30 days</p>
            <p>Bonus eligibility: enabled if bonus reserve exists</p>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-800/70 text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left">Pair</th>
                  <th className="px-4 py-3 text-left">LP Locked</th>
                  <th className="px-4 py-3 text-left">Receipt</th>
                  <th className="px-4 py-3 text-left">Unlock Date</th>
                  <th className="px-4 py-3 text-left">Bonus</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position) => (
                  <tr
                    key={position.id}
                    className="border-t border-slate-800 text-slate-200"
                  >
                    <td className="px-4 py-4 font-medium">{position.pair}</td>
                    <td className="px-4 py-4">{position.lpLocked}</td>
                    <td className="px-4 py-4">{position.receipt}</td>
                    <td className="px-4 py-4">{position.unlockDate}</td>
                    <td className="px-4 py-4">{position.bonus}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full border border-slate-600 px-3 py-1 text-xs">
                        {position.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        disabled
                        className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-medium text-white opacity-60"
                      >
                        Redeem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {positions.length === 0 && (
            <div className="px-6 py-12 text-center text-slate-400">
              No vault positions yet.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
