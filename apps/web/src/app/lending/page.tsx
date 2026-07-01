"use client";

import Link from "next/link";
import { useAccount, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import {
  LENDING_CORE_ADDRESS,
  PAIR_REGISTRY_ADDRESS,
  lendingAssets,
  lendingCoreAbi,
  pairRegistryAbi,
} from "../../lib/lending-contracts";

const RAY = BigInt("1000000000000000000000000000");

export default function LendingPage() {
  const { address, isConnected } = useAccount();

  // Читаємо market states для всіх активів
  const marketCalls = lendingAssets.map(a => ({
    address: LENDING_CORE_ADDRESS,
    abi: lendingCoreAbi,
    functionName: "marketStates" as const,
    args: [a.address] as const,
  }));

  const { data: markets } = useReadContracts({ contracts: marketCalls });

  // Читаємо borrow rates
  const rateCalls = lendingAssets.map(a => ({
    address: LENDING_CORE_ADDRESS,
    abi: lendingCoreAbi,
    functionName: "getBorrowRate" as const,
    args: [a.address] as const,
  }));

  const { data: rates } = useReadContracts({ contracts: rateCalls });

  function formatRate(rateRay: bigint): string {
    const rate = Number(rateRay) / Number(RAY);
    return (rate * 100).toFixed(2) + "%";
  }

  function formatLiquidity(shares: bigint): string {
    return parseFloat(formatUnits(shares, 18)).toFixed(4);
  }

  function getUtilization(market: any): string {
    if (!market) return "0%";
    const totalDebt = Number(market.totalScaledDebt) * Number(market.borrowIndexRay) / Number(RAY);
    const total = totalDebt + Number(market.totalLiquidityShares);
    if (total === 0) return "0%";
    return (totalDebt / total * 100).toFixed(1) + "%";
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">Lending</h1>
        <p className="text-slate-500">
          Децентралізоване кредитування під заставу студентських та тестових токенів.
          Модель ризику на основі кореляційного аналізу цін.
        </p>
      </header>

      {/* Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/lending/supply" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-slate-800">Supply Liquidity</h2>
          <p className="text-sm text-slate-500 mt-1">Надайте ліквідність і заробляйте відсотки</p>
          <div className="mt-4 text-blue-600 font-semibold text-sm">Почати →</div>
        </Link>
        <Link href="/lending/borrow" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-slate-800">Borrow</h2>
          <p className="text-sm text-slate-500 mt-1">Позичте токени під заставу</p>
          <div className="mt-4 text-blue-600 font-semibold text-sm">Почати →</div>
        </Link>
        <Link href="/lending/positions" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold text-slate-800">My Positions</h2>
          <p className="text-sm text-slate-500 mt-1">Керуйте своїми позиціями та HF</p>
          <div className="mt-4 text-blue-600 font-semibold text-sm">Переглянути →</div>
        </Link>
      </div>

      {/* Markets Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-700">Markets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Asset</th>
                <th className="px-5 py-3 text-left font-medium">Total Liquidity</th>
                <th className="px-5 py-3 text-left font-medium">Utilization</th>
                <th className="px-5 py-3 text-left font-medium">Borrow APR</th>
                <th className="px-5 py-3 text-left font-medium">Supply APR</th>
                <th className="px-5 py-3 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {lendingAssets.map((asset, i) => {
                const market = markets?.[i]?.result as any;
                const rateRay = rates?.[i]?.result as bigint | undefined;
                const borrowApr = rateRay ? formatRate(rateRay) : "—";
                const util = getUtilization(market);
                const utilNum = parseFloat(util);
                const supplyAprNum = rateRay && market
                  ? Number(rateRay) / Number(RAY) * (utilNum / 100) * 0.9 * 100
                  : 0;

                return (
                  <tr key={asset.address} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800">{asset.symbol}</div>
                      <div className="text-xs text-slate-400">{asset.name}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {market ? formatLiquidity(market.totalLiquidityShares) : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 max-w-20">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: util }}
                          />
                        </div>
                        <span className="text-slate-600 text-xs">{util}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{borrowApr}</td>
                    <td className="px-5 py-4 text-green-600">
                      {supplyAprNum > 0 ? supplyAprNum.toFixed(2) + "%" : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <Link href={"/lending/supply?asset=" + asset.address}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500">
                          Supply
                        </Link>
                        <Link href={"/lending/borrow?debt=" + asset.address}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                          Borrow
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Model Info */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h3 className="font-semibold text-amber-800 mb-2">Модель ризику</h3>
        <div className="grid gap-3 md:grid-cols-3 text-sm text-amber-700">
          <div>
            <div className="font-medium">Кореляційний критерій</div>
            <div className="text-xs mt-0.5">ρ_min = 0.40 — мінімальна кореляція пари для допуску</div>
          </div>
          <div>
            <div className="font-medium">Квантиль просідання</div>
            <div className="text-xs mt-0.5">δ_max = 15% — максимальне відносне падіння (VaR 5%)</div>
          </div>
          <div>
            <div className="font-medium">Guard threshold</div>
            <div className="text-xs mt-0.5">γ ∈ [3%, 12%] — швидке блокування при різкому падінні</div>
          </div>
        </div>
        <Link href="/risk" className="mt-3 inline-block text-xs text-amber-700 underline">
          Детальний Risk Dashboard →
        </Link>
      </div>
    </div>
  );
}
