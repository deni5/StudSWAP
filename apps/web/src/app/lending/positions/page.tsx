"use client";

import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { sepolia } from "wagmi/chains";
import { useState } from "react";
import {
  LENDING_CORE_ADDRESS,
  lendingAssets,
  lendingCoreAbi,
} from "../../../lib/lending-contracts";

const RAY = BigInt("1000000000000000000000000000");

export default function PositionsPage() {
  const { address } = useAccount();
  const [repayAmounts, setRepayAmounts] = useState<Record<string, string>>({});

  // Всі комбінації пар
  const pairs = lendingAssets.flatMap(coll =>
    lendingAssets.filter(d => d.address !== coll.address).map(debt => ({ coll, debt }))
  );

  // Читаємо всі позиції
  const posCalls = pairs.map(p => ({
    address: LENDING_CORE_ADDRESS,
    abi: lendingCoreAbi,
    functionName: "positions" as const,
    args: address ? [address, p.coll.address, p.debt.address] as const : undefined,
  }));

  const { data: posData } = useReadContracts({
    contracts: posCalls,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  // HF для активних позицій
  const hfCalls = pairs.map(p => ({
    address: LENDING_CORE_ADDRESS,
    abi: lendingCoreAbi,
    functionName: "getHealthFactor" as const,
    args: address ? [address, p.coll.address, p.debt.address] as const : undefined,
  }));

  const { data: hfData } = useReadContracts({
    contracts: hfCalls,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  // Market states для розрахунку боргу
  const marketCalls = lendingAssets.map(a => ({
    address: LENDING_CORE_ADDRESS,
    abi: lendingCoreAbi,
    functionName: "marketStates" as const,
    args: [a.address] as const,
  }));

  const { data: markets } = useReadContracts({ contracts: marketCalls });

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  // Фільтруємо активні позиції
  const activePositions = pairs
    .map((p, i) => {
      const pos = posData?.[i]?.result as any;
      const hf  = hfData?.[i]?.result as bigint | undefined;
      const marketIdx = lendingAssets.findIndex(a => a.address === p.debt.address);
      const market = markets?.[marketIdx]?.result as any;
      if (!pos || pos.collateralAmount === BigInt(0)) return null;
      const currentDebt = market
        ? Number(pos.scaledDebt) * Number(market.borrowIndexRay) / Number(RAY)
        : 0;
      return { ...p, pos, hf, currentDebt };
    })
    .filter(Boolean);

  function hfColor(hfRay: bigint) {
    const hf = Number(hfRay) / Number(RAY);
    if (hf >= 1.5) return "text-green-600";
    if (hf >= 1.1) return "text-amber-500";
    return "text-red-600";
  }

  function handleRepay(collAddr: `0x${string}`, debtAddr: `0x${string}`, key: string) {
    const amt = repayAmounts[key];
    if (!amt || !address) return;
    writeContract({
      address: LENDING_CORE_ADDRESS,
      abi: lendingCoreAbi,
      functionName: "repay",
      args: [collAddr, debtAddr, parseUnits(amt, 18)],
      chain: sepolia,
      account: address,
      gas: BigInt(300000),
    });
  }

  function handleWithdraw(collAddr: `0x${string}`, debtAddr: `0x${string}`, amount: bigint) {
    if (!address) return;
    writeContract({
      address: LENDING_CORE_ADDRESS,
      abi: lendingCoreAbi,
      functionName: "withdrawCollateral",
      args: [collAddr, debtAddr, amount],
      chain: sepolia,
      account: address,
      gas: BigInt(300000),
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">My Positions</h1>
        <p className="text-slate-500 mt-1">Active lending positions with Health Factor</p>
      </header>

      {!address && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
          Connect wallet to view positions
        </div>
      )}

      {address && activePositions.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
          No active positions. <a href="/lending/borrow" className="text-blue-600 hover:underline">Open position →</a>
        </div>
      )}

      {activePositions.map((item, i) => {
        if (!item) return null;
        const { coll, debt, pos, hf, currentDebt } = item;
        const hfNum = hf ? Number(hf) / Number(RAY) : 0;
        const key = coll.address + debt.address;

        return (
          <div key={key} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {coll.symbol} / {debt.symbol}
                </h2>
                <p className="text-sm text-slate-400">Collateral / Debt</p>
              </div>
              {hf && (
                <div className="text-right">
                  <div className={"text-2xl font-bold " + hfColor(hf)}>
                    {hfNum.toFixed(3)}
                  </div>
                  <div className="text-xs text-slate-400">Health Factor</div>
                </div>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-3 text-sm">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-slate-400 text-xs">Collateral</div>
                <div className="font-semibold text-slate-800 mt-1">
                  {parseFloat(formatUnits(pos.collateralAmount, 18)).toFixed(4)} {coll.symbol}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-slate-400 text-xs">Debt (with interest)</div>
                <div className="font-semibold text-slate-800 mt-1">
                  {(currentDebt / 1e18).toFixed(6)} {debt.symbol}
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-slate-400 text-xs">Opened</div>
                <div className="font-semibold text-slate-800 mt-1">
                  {new Date(Number(pos.openedAt) * 1000).toLocaleDateString()}
                </div>
              </div>
            </div>

            {hfNum < 1.2 && hfNum > 0 && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                ⚠️ HF below 1.2 — repay some debt to avoid liquidation
              </div>
            )}

            <div className="flex gap-3 items-center">
              <input
                type="number"
                min="0"
                placeholder="Repay amount"
                value={repayAmounts[key] ?? ""}
                onChange={e => setRepayAmounts(prev => ({ ...prev, [key]: e.target.value }))}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800"
              />
              <button
                onClick={() => handleRepay(coll.address, debt.address, key)}
                disabled={isPending || !repayAmounts[key]}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40 hover:bg-blue-500"
              >
                Repay
              </button>
              {currentDebt === 0 && (
                <button
                  onClick={() => handleWithdraw(coll.address, debt.address, pos.collateralAmount)}
                  disabled={isPending}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Withdraw All
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
