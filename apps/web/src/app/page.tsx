import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

export default function HomePage() {
  const { address, isConnected } = useAccount()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-yellow-100 text-yellow-900 p-3 text-center">
        Sepolia testnet only: switch to Sepolia (11155111) before using protected actions.
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">DeFiLab Student Token Platform</h1>
            <p className="text-gray-600 mt-2">
              Register student tokens, create pairs, add liquidity, and manage vault/redeem positions.
            </p>
          </div>

          <ConnectButton />
        </div>

        <section className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold mb-2">Wallet</h2>
          <p className="text-sm text-gray-700">
            {isConnected ? `Connected: ${address}` : 'Connect your wallet to continue.'}
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border bg-white p-4">
            <div className="font-semibold">Register Token</div>
            <p className="text-sm text-gray-500 mt-2">Add your student token and optional bonus mode.</p>
            <Link href="/register-token" className="text-sm text-blue-600 underline mt-3 inline-block">
              Go to register
            </Link>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <div className="font-semibold">Create Pair</div>
            <p className="text-sm text-gray-500 mt-2">Check if a pair exists and launch one if not.</p>
            <Link href="/create-pool" className="text-sm text-blue-600 underline mt-3 inline-block">
              Create pool
            </Link>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <div className="font-semibold">Add Liquidity</div>
            <p className="text-sm text-gray-500 mt-2">Provide tokens to kickstart the market.</p>
            <Link href="/add-liquidity" className="text-sm text-blue-600 underline mt-3 inline-block">
              Add liquidity
            </Link>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <div className="font-semibold">Vault / Redeem</div>
            <p className="text-sm text-gray-500 mt-2">Lock LP tokens and redeem later for LP + bonus.</p>
            <Link href="/vault" className="text-sm text-blue-600 underline mt-3 inline-block">
              Vault actions
            </Link>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/tokens" className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm">
            View tokens
          </Link>
          <Link href="/register-token" className="rounded-lg bg-gray-200 text-gray-900 px-4 py-2 text-sm">
            Register token
          </Link>
        </div>
      </div>
    </main>
  )
}
