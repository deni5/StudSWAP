import Link from "next/link"

export default function TokenDetailPage({ params }: { params: { address: string } }) {
  const mock = {
    symbol: "STU",
    name: "Student Token",
    address: params.address,
    category: "Faculty / category placeholder",
    description: "Mock metadata placeholder for registry integration.",
    logoUrl: "",
    status: "unverified",
    bonusEnabled: false,
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {mock.name} <span className="text-muted-foreground text-lg">{mock.symbol}</span>
            </h1>
            <p className="text-muted-foreground mt-2">Token details (mock registry data for now).</p>
          </div>
          <span className="rounded-full border px-3 py-1 text-xs">{mock.status}</span>
        </header>

        <div className="grid gap-6">
          <section className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold mb-2">Address</h2>
            <p className="font-mono text-sm break-all">{mock.address}</p>
          </section>

          <section className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold mb-2">Metadata</h2>
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-muted-foreground">Category</div>
                <div>{mock.category}</div>
              </div>

              <div>
                <div className="text-muted-foreground">Description</div>
                <div>{mock.description}</div>
              </div>

              <div>
                <div className="text-muted-foreground">Logo</div>
                <div>{mock.logoUrl || "No logo"}</div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold mb-2">Bonus mode</h2>
            <p className="text-sm text-muted-foreground">
              {mock.bonusEnabled ? "Bonus enabled (mock info)" : "Bonus not enabled (mock info)"}
            </p>
          </section>

          <section className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold mb-3">Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/create-pool" className="rounded-md border px-4 py-2 text-sm">
                Create Pair
              </Link>
              <Link href="/add-liquidity" className="rounded-md border px-4 py-2 text-sm">
                Add Liquidity
              </Link>
              <Link href="/tokens" className="rounded-md border px-4 py-2 text-sm bg-muted">
                Back to Tokens
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
