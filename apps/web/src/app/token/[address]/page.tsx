"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useReadContract } from "wagmi";
import {
  STUDENT_TOKEN_REGISTRY_ADDRESS,
  PAIR_LAUNCHER_ADDRESS,
  studentTokenRegistryAbi,
  pairLauncherAbi,
} from "../../../lib/contracts";

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
  return value.slice(0, 6) + "..." + value.slice(-4);
}

function etherscanLink(address: string) {
  return "https://sepolia.etherscan.io/address/" + address;
}

export default function TokenDetailPage() {
  const params = useParams();
  const address = params.address as string;

  const { data: tokenData, isLoading } = useReadContract({
    address: STUDENT_TOKEN_REGISTRY_ADDRESS,
    abi: studentTokenRegistryAbi,
    functionName: "getToken",
    args: [address as `0x${string}`],
  });

  const token = tokenData as RegistryToken | undefined;

  const { data: allPairs } = useReadContract({
    address: PAIR_LAUNCHER_ADDRESS,
    abi: pairLauncherAbi,
    functionName: "getAllPairRecords",
  });

  const pairs = (allPairs as unknown as any[] | undefined)?.filter(
    (p) => p.exists && (p.token?.toLowerCase() === address?.toLowerCase() || p.baseToken?.toLowerCase() === address?.toLowerCase())
  ) ?? [];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 shadow-sm">
          Loading token details...
        </div>
      </div>
    );
  }

  if (!token?.exists) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10 space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm space-y-4">
          <p className="text-slate-500">Token not found or not registered.</p>
          <Link href="/tokens" className="inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500">
            Back to Tokens
          </Link>
        </div>
      </div>
    );
  }

  const unlockDate = token.createdAt
    ? new Date((Number(token.createdAt) + 30 * 24 * 3600) * 1000).toLocaleDateString()
    : "N/A";

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-10">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {token.logoUrl && (
            <img src={token.logoUrl} alt={token.symbol} className="w-14 h-14 rounded-full object-cover border border-slate-200" onError={(e) => (e.currentTarget.style.display = "none")} />
          )}
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{token.title}</h1>
            <p className="text-slate-500">{token.symbol} · {token.category}</p>
          </div>
        </div>
        <Link href="/tokens" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          ← Back
        </Link>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-700">Token Info</h2>
          <div className="space-y-3 text-sm">
            <Row label="Token address">
              <a href={etherscanLink(token.token)} target="_blank" rel="noopener noreferrer" className="font-mono text-blue-600 hover:underline">
                {shortenAddress(token.token)}
              </a>
            </Row>
            <Row label="Creator">
              <a href={etherscanLink(token.creator)} target="_blank" rel="noopener noreferrer" className="font-mono text-blue-600 hover:underline">
                {shortenAddress(token.creator)}
              </a>
            </Row>
            <Row label="Base token">
              <a href={etherscanLink(token.baseToken)} target="_blank" rel="noopener noreferrer" className="font-mono text-blue-600 hover:underline">
                {shortenAddress(token.baseToken)}
              </a>
            </Row>
            <Row label="Category">{token.category}</Row>
            <Row label="Status">
              <span className="rounded-full border border-slate-200 px-3 py-0.5 text-xs font-medium text-slate-600">Registered</span>
            </Row>
            <Row label="Bonus">
              <span className={"rounded-full px-3 py-0.5 text-xs font-medium " + (token.bonusEnabled ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500")}>
                {token.bonusEnabled ? "Enabled" : "Disabled"}
              </span>
            </Row>
            {token.bonusEnabled && (
              <Row label="Bonus unlock">{unlockDate}</Row>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-700">Description</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{token.description || "No description provided."}</p>

          <div className="pt-4 space-y-2">
            <Link
              href={"/create-pool?token=" + token.token}
              className="block text-center rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              Create Pool
            </Link>
            <Link
              href={"/swap?tokenIn=" + token.token}
              className="block text-center rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Swap
            </Link>
          </div>
        </div>
      </div>

      {pairs.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-700">Trading Pairs</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">Pair address</th>
                  <th className="px-5 py-3 text-left font-medium">Token</th>
                  <th className="px-5 py-3 text-left font-medium">Base token</th>
                  <th className="px-5 py-3 text-left font-medium">Creator</th>
                  <th className="px-5 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {pairs.map((pair: any, i: number) => (
                  <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">
                      <a href={etherscanLink(pair.pair)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {shortenAddress(pair.pair)}
                      </a>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{shortenAddress(pair.token)}</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{shortenAddress(pair.baseToken)}</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{shortenAddress(pair.creator)}</td>
                    <td className="px-5 py-4">
                      <Link href={"/add-liquidity"} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                        Add Liquidity
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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-700 font-medium">{children}</span>
    </div>
  );
}
