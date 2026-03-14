export default function PortfolioPage() {
  const tokenBalances = [
    { symbol: "STUD", balance: "12,500.00", value: "~26.25 SepETH" },
    { symbol: "MATH", balance: "3,200.00", value: "~14,400 STUD" },
    { symbol: "SepETH", balance: "1.2450", value: "Base asset" },
  ];

  const lpPositions = [
    { pair: "STUD / SepETH", lp: "125.40 LP", share: "4.8%" },
    { pair: "MATH / STUD", lp: "80.00 LP", share: "3.1%" },
  ];

  const vaultPositions = [
    {
      pair: "STUD / SepETH",
      receipt: "rSTUD-SEP-125",
      unlockDate: "2026-04-15",
      status: "Locked",
    },
    {
      pair: "MATH / STUD",
      receipt: "rMATH-STUD-080",
      unlockDate: "2026-04-22",
      status: "Redeemable Soon",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold">Portfolio</h1>
          <p className="text-slate-300 max-w-3xl">
            Review your token balances, LP positions, and vault receipt holdings
            in one place.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Wallet Assets</p>
            <p className="mt-2 text-2xl font-semibold">3 Tokens</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">LP Positions</p>
            <p className="mt-2 text-2xl font-semibold">2 Pools</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Vault Positions</p>
            <p className="mt-2 text-2xl font-semibold">2 Locked</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <h2 className="text-xl font-semibold">Token Balances</h2>
            <div className="space-y-3">
              {tokenBalances.map((token) => (
                <div
                  key={token.symbol}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{token.symbol}</span>
                    <span>{token.balance}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{token.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <h2 className="text-xl font-semibold">LP Positions</h2>
            <div className="space-y-3">
              {lpPositions.map((position) => (
                <div
                  key={position.pair}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{position.pair}</span>
                    <span>{position.lp}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    Pool share: {position.share}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <h2 className="text-xl font-semibold">Vault Positions</h2>
            <div className="space-y-3">
              {vaultPositions.map((position) => (
                <div
                  key={position.receipt}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{position.pair}</span>
                    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs">
                      {position.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    Receipt: {position.receipt}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Unlock date: {position.unlockDate}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex flex-wrap gap-3">
          <a
            href="/market"
            className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-500"
          >
            Open Market
          </a>
          <a
            href="/vault"
            className="rounded-xl border border-slate-600 px-5 py-3 font-medium text-white hover:bg-slate-800"
          >
            Open Vault
          </a>
        </section>
      </div>
    </main>
  );
}
