"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import Link from "next/link";
import {
  STUDENT_TOKEN_REGISTRY_ADDRESS,
  PAIR_LAUNCHER_ADDRESS,
  studentTokenRegistryAbi,
  pairLauncherAbi,
} from "../../lib/contracts";

const RECEIPT_VAULT = "0xf73E71b16494F88E56C6176fc7968033Af0bbC96" as const;

const vaultAbi = [
  {
    type: "function",
    name: "getUserPositions",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      {
        components: [
          { name: "owner", type: "address" },
          { name: "lpToken", type: "address" },
          { name: "lpAmount", type: "uint256" },
          { name: "receiptAmount", type: "uint256" },
          { name: "depositedAt", type: "uint256" },
          { name: "unlockAt", type: "uint256" },
          { name: "redeemed", type: "bool" },
        ],
        name: "",
        type: "tuple[]",
      },
    ],
  },
] as const;

const erc20Abi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const pairAbi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "totalSupply",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

type TokenRecord = {
  token: string;
  title: string;
  symbol: string;
  exists: boolean;
};

type PairRecord = {
  token: string;
  baseToken: string;
  pair: string;
  creator: string;
  createdAt: bigint;
  exists: boolean;
};

type VaultPosition = {
  owner: string;
  lpToken: string;
  lpAmount: bigint;
  receiptAmount: bigint;
  depositedAt: bigint;
  unlockAt: bigint;
  redeemed: boolean;
};

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();

  const { data: allTokens } = useReadContract({
    address: STUDENT_TOKEN_REGISTRY_ADDRESS,
    abi: studentTokenRegistryAbi,
    functionName: "getAllTokens",
  });

  const { data: allPairs } = useReadContract({
    address: PAIR_LAUNCHER_ADDRESS,
    abi: pairLauncherAbi,
    functionName: "getAllPairRecords",
  });

  const { data: vaultPositions } = useReadContract({
    address: RECEIPT_VAULT,
    abi: vaultAbi,
    functionName: "getUserPositions",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const tokens = (allTokens as unknown as TokenRecord[] | undefined)?.filter((t) => t.exists) ?? [];
  const pairs = (allPairs as unknown as PairRecord[] | undefined)?.filter((p) => p.exists) ?? [];
  const positions = (vaultPositions as unknown as VaultPosition[] | undefined) ?? [];

  const tokenBalanceContracts = tokens.map((t) => ({
    address: t.token as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf" as const,
    args: address ? [address as `0x${string}`] : undefined,
  }));

  const { data: tokenBalances } = useReadContracts({
    contracts: tokenBalanceContracts,
    query: { enabled: (!!address && tokens.length > 0) },
  });

  const lpBalanceContracts = pairs.map((p) => ({
    address: p.pair as `0x${string}`,
    abi: pairAbi,
    functionName: "balanceOf" as const,
    args: address ? [address as `0x${string}`] : undefined,
  }));

  const totalSupplyContracts = pairs.map((p) => ({
    address: p.pair as `0x${string}`,
    abi: pairAbi,
    functionName: "totalSupply" as const,
  }));

  const { data: lpBalances } = useReadContracts({
    contracts: lpBalanceContracts,
    query: { enabled: (!!address && pairs.length > 0) },
  });

  const { data: totalSupplies } = useReadContracts({
    contracts: totalSupplyContracts,
    query: { enabled: pairs.length > 0 },
  });

  const activeVaultPositions = positions.filter((p) => !p.redeemed);
  const myLpPositions = pairs.filter((_, i) => {
    const bal = lpBalances?.[i]?.result as bigint | undefined;
    return bal && bal > BigInt(0);
  });

  const tokenName = (addr: string) => {
    const t = tokens.find((t) => t.token.toLowerCase() === addr.toLowerCase());
    return t ? t.symbol : addr.slice(0, 8) + "...";
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-800">Portfolio</h1>
        <p className="text-slate-500 max-w-2xl">
          Your token balances, LP positions, and vault holdings on Sepolia.
        </p>
        <ConnectButton />
      </header>

      {!isConnected ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 shadow-sm">
          Connect wallet to view your portfolio.
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-400">Registered Tokens</p>
              <p className="mt-2 text-2xl font-semibold text-slate-800">{tokens.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-400">My LP Positions</p>
              <p className="mt-2 text-2xl font-semibold text-slate-800">{myLpPositions.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-400">Vault Positions</p>
              <p className="mt-2 text-2xl font-semibold text-slate-800">{activeVaultPositions.length}</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-slate-700">Token Balances</h2>
              {tokens.length === 0 ? (
                <p className="text-sm text-slate-400">No registered tokens.</p>
              ) : (
                <div className="space-y-3">
                  {tokens.map((token, i) => {
                    const bal = tokenBalances?.[i]?.result as bigint | undefined;
                    return (
                      <div key={token.token} className="rounded-xl bg-slate-50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-800">{token.symbol}</span>
                          <span className="text-slate-600">{bal !== undefined ? formatUnits(bal, 18) : "..."}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">{token.title}</p>
                      </div>
                    );
                  })}
                </div>
              )}
              <Link href="/register-token" className="block text-center rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                Register Token
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-slate-700">LP Positions</h2>
              {pairs.length === 0 ? (
                <p className="text-sm text-slate-400">No pools found.</p>
              ) : (
                <div className="space-y-3">
                  {pairs.map((pair, i) => {
                    const bal = lpBalances?.[i]?.result as bigint | undefined;
                    const supply = totalSupplies?.[i]?.result as bigint | undefined;
                    const share = bal && supply && supply > BigInt(0)
                      ? ((Number(bal) / Number(supply)) * 100).toFixed(2) + "%"
                      : "0%";
                    if (!bal || bal === BigInt(0)) return null;
                    return (
                      <div key={pair.pair} className="rounded-xl bg-slate-50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-800 text-sm">
                            {tokenName(pair.token)} / {tokenName(pair.baseToken)}
                          </span>
                          <span className="text-slate-600 text-sm">{share}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">{formatUnits(bal, 18)} LP</p>
                      </div>
                    );
                  })}
                  {myLpPositions.length === 0 && (
                    <p className="text-sm text-slate-400">No LP positions yet.</p>
                  )}
                </div>
              )}
              <Link href="/add-liquidity" className="block text-center rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                Add Liquidity
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-slate-700">Vault Positions</h2>
              {activeVaultPositions.length === 0 ? (
                <p className="text-sm text-slate-400">No vault positions yet.</p>
              ) : (
                <div className="space-y-3">
                  {activeVaultPositions.map((pos, i) => {
                    const unlockDate = new Date(Number(pos.unlockAt) * 1000).toLocaleDateString();
                    const now = Math.floor(Date.now() / 1000);
                    const redeemable = Number(pos.unlockAt) <= now;
                    return (
                      <div key={i} className="rounded-xl bg-slate-50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-800 text-sm">
                            {tokenName(pos.lpToken)}
                          </span>
                          <span className={"rounded-full px-2 py-0.5 text-xs font-medium " + (redeemable ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                            {redeemable ? "Redeemable" : "Locked"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">{formatUnits(pos.lpAmount, 18)} LP locked</p>
                        <p className="text-xs text-slate-400">Unlock: {unlockDate}</p>
                      </div>
                    );
                  })}
                </div>
              )}
              <Link href="/vault" className="block text-center rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                Open Vault
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/swap" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500">
              Swap
            </Link>
            <Link href="/create-pool" className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-50">
              Create Pool
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
