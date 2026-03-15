"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useReadContract } from "wagmi";
import {
  STUDENT_TOKEN_REGISTRY_ADDRESS,
  studentTokenRegistryAbi,
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

export default function TokenDetailPage() {
  const params = useParams();
  const tokenAddress = params?.address as `0x${string}` | undefined;

  const tokenQuery = useReadContract({
    address: STUDENT_TOKEN_REGISTRY_ADDRESS,
    abi: studentTokenRegistryAbi,
    functionName: "getToken",
    args: tokenAddress ? [tokenAddress] : undefined,
    query: {
      enabled:
        !!tokenAddress &&
        !!STUDENT_TOKEN_REGISTRY_ADDRESS &&
        STUDENT_TOKEN_REGISTRY_ADDRESS !==
          "0x0000000000000000000000000000000000000000",
    },
  });

  const token = tokenQuery.data as RegistryToken | undefined;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold">Token Details</h1>
          <p className="text-slate-300">
            View on-chain registry metadata for a specific student token.
          </p>
        </header>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/tokens"
            className="rounded-xl border border-slate-600 px-5 py-3 font-medium text-white hover:bg-slate-800"
          >
            Back to Tokens
          </Link>
          <Link
            href="/create-pool"
            className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-500"
          >
            Create Pair
          </Link>
          <Link
            href="/add-liquidity"
            className="rounded-xl border border-slate-600 px-5 py-3 font-medium text-white hover:bg-slate-800"
          >
            Add Liquidity
          </Link>
        </div>

        {tokenQuery.isLoading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
            Loading token data...
          </div>
        )}

        {tokenQuery.isError && (
          <div className="rounded-2xl border border-red-800 bg-red-950/40 p-6 text-red-300">
            Failed to load token data from the registry.
          </div>
        )}

        {!tokenQuery.isLoading && !tokenQuery.isError && !token && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
            Token not found.
          </div>
        )}

        {token && (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">Symbol</p>
                <p className="mt-2 text-2xl font-semibold">{token.symbol}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">Title</p>
                <p className="mt-2 text-2xl font-semibold">{token.title}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">Status</p>
                <p className="mt-2 text-2xl font-semibold">
                  {statusLabel(token.status)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">Bonus</p>
                <p className="mt-2 text-2xl font-semibold">
                  {token.bonusEnabled ? "Enabled" : "Disabled"}
                </p>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
                <h2 className="text-2xl font-semibold">Metadata</h2>

                <InfoRow label="Token address" value={token.token} mono />
                <InfoRow label="Creator" value={token.creator} mono />
                <InfoRow label="Category" value={token.category} />
                <InfoRow label="Logo URL" value={token.logoUrl || "—"} />
                <InfoRow label="Description" value={token.description} />
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
                <h2 className="text-2xl font-semibold">Pool & Bonus Settings</h2>

                <InfoRow label="Base token" value={token.baseToken} mono />
                <InfoRow
                  label="Reward asset"
                  value={
                    token.bonusEnabled ? token.rewardAsset : "Bonus disabled"
                  }
                  mono={token.bonusEnabled}
                />
                <InfoRow
                  label="Bonus reserve"
                  value={token.bonusReserve.toString()}
                />
                <InfoRow
                  label="Created at"
                  value={token.createdAt.toString()}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-2xl font-semibold">Quick Actions</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/create-pool"
                  className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-500"
                >
                  Create Pair
                </Link>
                <Link
                  href="/add-liquidity"
                  className="rounded-xl border border-slate-600 px-5 py-3 font-medium text-white hover:bg-slate-800"
                >
                  Add Liquidity
                </Link>
                <Link
                  href="/market"
                  className="rounded-xl border border-slate-600 px-5 py-3 font-medium text-white hover:bg-slate-800"
                >
                  Open Market
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-2 break-all ${mono ? "font-mono text-sm" : ""}`}>
        {mono && value.startsWith("0x") ? shortenAddress(value) : value}
      </p>
    </div>
  );
}
