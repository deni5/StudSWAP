"use client";

import Link from "next/link";
import { useTokenRegistry } from "../../hooks/useTokenRegistry";

type RegistryToken = {
  token: string;
  creator: string;
  title: string;
  symbol: string;
  description: string;
  category: string;
  logoUrl: string;
  baseToken: string;
  bonusEnabled: boolean;
  rewardAsset: string;
  bonusReserve: bigint;
  createdAt: bigint;
  status: number;
  exists: boolean;
};

export default function TokensPage() {
  const { tokens, isLoading } = useTokenRegistry();

  const activeTokens = (tokens as RegistryToken[] | undefined)?.filter((t) => t.exists) ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-800">Registered Tokens</h1>
          <p className="text-slate-500">Browse student ERC-20 tokens registered in the StudSWAP registry.</p>
        </div>
        <Link
          href="/register-token"
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500 transition-colors"
        >
          Register New Token
        </Link>
      </header>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 shadow-sm">
          Loading tokens...
        </div>
      ) : activeTokens.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm space-y-4">
          <p className="text-slate-400">No tokens registered yet.</p>
          <Link href="/register-token" className="inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500">
            Register First Token
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Symbol</th>
                  <th className="px-5 py-3 text-left font-medium">Title</th>
                  <th className="px-5 py-3 text-left font-medium">Token</th>
                  <th className="px-5 py-3 text-left font-medium">Creator</th>
                  <th className="px-5 py-3 text-left font-medium">Category</th>
                  <th className="px-5 py-3 text-left font-medium">Bonus</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeTokens.map((token) => (
                  <tr key={token.token} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-800">{token.symbol}</td>
                    <td className="px-5 py-4 text-slate-700">{token.title}</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">
                      {token.token.slice(0, 6)}...{token.token.slice(-4)}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">
                      {token.creator.slice(0, 6)}...{token.creator.slice(-4)}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{token.category}</td>
                    <td className="px-5 py-4">
                      <span className={"rounded-full px-2 py-0.5 text-xs font-medium " + (token.bonusEnabled ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500")}>
                        {token.bonusEnabled ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                        Registered
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={"/token/" + token.token}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
