export default function RegisterTokenPage() {
  // TODO: wire to StudentTokenRegistry contract
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl font-bold">Register Token</h1>
          <p className="text-muted-foreground mt-2">
            Add a student token to the platform registry.
          </p>
        </header>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Token address</label>
              <input className="w-full rounded-lg border px-3 py-2" placeholder="0x..." />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input className="w-full rounded-lg border px-3 py-2" placeholder="Example Token" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input className="w-full rounded-lg border px-3 py-2" placeholder="Faculty / Category" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Logo URL</label>
              <input className="w-full rounded-lg border px-3 py-2" placeholder="https://..." />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea className="w-full rounded-lg border px-3 py-2" rows={4} placeholder="Short description" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Base token</label>
              <select className="w-full rounded-lg border px-3 py-2">
                <option value="">Select base token</option>
                <option value="WETH">WETH (Sepolia)</option>
                {/* TODO: populate with registered tokens */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Reward asset</label>
              <input className="w-full rounded-lg border px-3 py-2" placeholder="0x..." />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border px-3 py-2">
            <input id="bonus" type="checkbox" className="h-4 w-4" />
            <label htmlFor="bonus" className="text-sm">
              Enable 30-day redeem with bonus
            </label>
          </div>

          <button
            type="submit"
            disabled
            className="w-full rounded-lg bg-muted text-muted-foreground py-2 font-semibold"
            title="Integration not wired yet"
          >
            Submit (disabled)
          </button>

          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Form validation UI placeholder: show required field errors and address checks when wired.
          </div>
        </form>
      </section>
    </main>
  )
}
