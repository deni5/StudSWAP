import Link from 'next/link'

export default function CreatePoolPage() {
  return (
    <div className="container mx-auto max-w-5xl py-10 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Create Pool</h1>
        <p className="text-gray-600 mt-2">
          Create a liquidity pool between a registered student token and a base token.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <section className="md:col-span-2 bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Pair configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Token to pair</label>
              <select className="mt-1 w-full rounded border border-gray-300 p-2">
                <option value="">Select token</option>
                <option value="studentToken1">StudentToken #1</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Base token</label>
              <select className="mt-1 w-full rounded border border-gray-300 p-2">
                <option value="">Select base token</option>
                <option value="weth">Sepolia WETH</option>
                <option value="studentToken2">Another registered token</option>
              </select>
            </div>

            <div className="text-sm text-gray-500">
              Tip: base token must be allowed (WETH or already registered token).
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              className="flex-1 rounded bg-green-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
              disabled
            >
              Create Pair
            </button>
            <Link
              href="/tokens"
              className="rounded border border-gray-300 px-4 py-2 font-semibold text-gray-700"
            >
              Back
            </Link>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Pair preview</h2>
          <div className="rounded border border-dashed border-gray-300 p-4 text-sm text-gray-600">
            <p className="font-medium">Preview</p>
            <p className="mt-2">pair: token / base token</p>
            <p className="mt-1">price: (after reserves exist)</p>
          </div>

          <div className="mt-6 rounded border border-dashed border-gray-300 p-4 text-sm text-gray-600">
            <p className="font-medium">Pair existence check</p>
            <p className="mt-2 text-gray-500">
              placeholder: call pair launcher to check if pair already exists.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
