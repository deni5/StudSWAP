export default function TokensPage() {
  const tokens = [
    {
      symbol: "DPT",
      name: "DeFiLab Points",
      address: "0x1111111111111111111111111111111111111111",
      status: "verified",
    },
    {
      symbol: "STU",
      name: "Student Token",
      address: "0x2222222222222222222222222222222222222222",
      status: "unverified",
    },
  ]

  const hasTokens = tokens.length > 0

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl font-bold">Tokens</h1>
          <p className="text-muted-foreground mt-2">
            Registered student tokens on the platform.
          </p>
        </header>

        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-xl border bg-card p-6">
            <div>
              <label className="text-sm font-semibold">Search</label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Search by symbol or address..."
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
              <div className="space-x-2">
                <span className="font-semibold">Status:</span>
                <span className="rounded-full border px-3 py-1 text-xs">All</span>
                <span className="rounded-full border px-3 py-1 text-xs">Verified</span>
                <span className="rounded-full border px-3 py-1 text-xs">Unverified</span>
              </div>

              <div className="text-muted-foreground">Mock data placeholder</div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <p className="font-semibold mb-2">Token list</p>

            {!hasTokens ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                No tokens registered yet.
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2">Symbol</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Address</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {tokens.map((t) => (
                      <tr key={t.address} className="border-t">
                        <td className="px-3 py-2 font-semibold">{t.symbol}</td>
                        <td className="px-3 py-2">{t.name}</td>
                        <td className="px-3 py-2 text-xs font-mono">{t.address}</td>
                        <td className="px-3 py-2">
                          <span className="rounded-full border px-3 py-1 text-xs">{t.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
