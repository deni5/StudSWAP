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

function shortenAddress(value?: string) {
  if (!value) return "";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function statusLabel(status: number) {
  switch (status) {
    case 0:
      return "Draft";
    case 1:
      return "Registered";
    case 2:
      return "Pool Created";
    case 3:
      return "Tradable";
    case 4:
      return "Hidden";
    case 5:
      return "Blocked";
    default:
      return "Unknown";
  }
}

export default function TokensPage() {
  const { allTokensQuery } = useTokenRegistry();

  const tokens = (allTokensQuery.data || []) as RegistryToken[];

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold">Registered Tokens</h1>
          <p className="max-w-3xl text-slate-300">
            Browse student ERC-20 tokens already registered in the StudSWAP
            on-chain registry.
          </p>
        </header>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/register-token"
            className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-500"
          >
            Register New Token
          </Link>
        </div>

        {allTokensQuery.isLoading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
            Loading registered tokens...
          </div>
        )}

        {allTokensQuery.isError && (
          <div className="rounded-2xl border border-red-800 bg-red-950/40 p-6 text-red-300">
            Failed to load tokens from the registry.
          </div>
        )}

        {!allTokensQuery.isLoading && !allTokensQuery.isError && tokens.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
            No registered tokens yet.
          </div>
        )}

        {tokens.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-800/70 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 text-left">Symbol</th>
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-left">Token</th>
                    <th className="px-4 py-3 text-left">Creator</th>
                    <th className="px-4 py-3 text-left">Base Token</th>
                    <th className="px-4 py-3 text-left">Bonus</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((item) => (
                    <tr
                      key={item.token}
                      className="border-t border-slate-800 text-slate-200"
                    >
                      <td className="px-4 py-4 font-medium">{item.symbol}</td>
                      <td className="px-4 py-4">{item.title}</td>
                      <td className="px-4 py-4 font-mono text-xs">
                        {shortenAddress(item.token)}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs">
                        {shortenAddress(item.creator)}
                      </td>
                      <td className="px-4 py-4 font-mono text-xs">
                        {shortenAddress(item.baseToken)}
                      </td>
                      <td className="px-4 py-4">
                        {item.bonusEnabled
                          ? `Yes (${item.bonusReserve.toString()})`
                          : "No"}
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full border border-slate-600 px-3 py-1 text-xs">
                          {statusLabel(item.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/token/${item.token}`}
                          className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
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
    </main>
  );
}


