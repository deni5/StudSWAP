import Link from 'next/link'

export default function AddLiquidityPage() {
  return (
    <div className="container mx-auto max-w-5xl py-10 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Add Liquidity</h1>
        <p className="text-gray-600 mt-2">
          Add liquidity to a pool and preview price + pool share.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <section className="md:col-span-2 bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Liquidity amounts</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Token amount</label>
              <input
                className="mt-1 w-full rounded border border-gray-300 p-2"
                placeholder="0.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Base token amount</label>
              <input
                className="mt-1 w-full rounded border border-gray-300 p-2"
                placeholder="0.0"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              className="flex-1 rounded bg-green-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
              disabled
            >
              Add Liquidity
            </button>

            <Link
              href="/market"
              className="rounded border border-gray-300 px-4 py-2 font-semibold text-gray-700"
            >
              Back
            </Link>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          <div className="rounded border border-dashed border-gray-300 p-4 text-sm text-gray-600">
            <p className="font-medium">Pair info</p>
            <p className="mt-2">pair: token / base token</p>
            <p className="mt-1">price preview: N/A (mock)</p>
            <p className="mt-1">pool share preview: N/A (mock)</p>
          </div>
        </section>
      </div>
    </div>
  )
}
