export default function TokensPage() {
  // TODO: replace placeholders with registry integration
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
          <div className="rounded-xl border bg-card p-6">
            <p className="font-semibold mb-2">Token list</p>
            <div className="text-sm text-muted-foreground mb-4">
              {/* Loading state placeholder */}
              Loading token registry...
            </div>
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              {/* Empty state placeholder */}
              No tokens registered yet. Submit one from the Register Token page.
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
