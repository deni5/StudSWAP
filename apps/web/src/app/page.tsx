import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-yellow-100 text-yellow-900 p-4 text-center">
        Testnet warning: StudSWAP runs on Sepolia testnet (11155111).
      </div>

      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">StudSWAP</h1>
            <p className="text-gray-600">Student token registry + university AMM MVP (mock UI)</p>
          </div>
          <ConnectButton />
        </div>

        <div className="border rounded-lg p-4 bg-white">
          <p className="text-sm text-gray-700">
            This is a UI shell; contract calls require deploy addresses in env and hooks.
          </p>
          <p className="mt-2 text-sm text-gray-500">Navigate to register-token to add your token to the registry.</p>
        </div>
      </div>
    </main>
  )
}
