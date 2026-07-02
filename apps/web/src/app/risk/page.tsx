"use client";

import { useReadContracts } from "wagmi";
import {
  LENDING_CORE_ADDRESS,
  PAIR_REGISTRY_ADDRESS,
  lendingAssets,
  lendingCoreAbi,
  pairRegistryAbi,
} from "../../lib/lending-contracts";

const RAY = BigInt("1000000000000000000000000000");

export default function RiskDashboard() {
  const pairs = lendingAssets.flatMap(coll =>
    lendingAssets
      .filter(d => d.address !== coll.address)
      .map(debt => ({ coll, debt }))
  );

  const pairCalls = pairs.map(p => ({
    address: PAIR_REGISTRY_ADDRESS,
    abi: pairRegistryAbi,
    functionName: "getPairConfig" as const,
    args: [p.coll.address, p.debt.address] as const,
  }));

  const { data: pairData } = useReadContracts({
    contracts: pairCalls,
    query: { refetchInterval: 30000 },
  });

  const marketCalls = lendingAssets.map(a => ({
    address: LENDING_CORE_ADDRESS,
    abi: lendingCoreAbi,
    functionName: "marketStates" as const,
    args: [a.address] as const,
  }));

  const { data: markets } = useReadContracts({
    contracts: marketCalls,
    query: { refetchInterval: 10000 },
  });

  const rateCalls = lendingAssets.map(a => ({
    address: LENDING_CORE_ADDRESS,
    abi: lendingCoreAbi,
    functionName: "getBorrowRate" as const,
    args: [a.address] as const,
  }));

  const { data: rates } = useReadContracts({ contracts: rateCalls });

  function riskBadge(allowed: boolean, ltv: number) {
    if (!allowed) return <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-medium">Rejected</span>;
    if (ltv >= 6000) return <span className="rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs font-medium">Low</span>;
    if (ltv >= 4000) return <span className="rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs font-medium">Medium</span>;
    return <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-medium">High</span>;
  }

  const allowedPairs  = pairData?.filter(p => (p.result as any)?.allowed).length ?? 0;
  const rejectedPairs = pairData?.filter(p => !(p.result as any)?.allowed).length ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-800">Risk Dashboard</h1>
          <span className="rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-sm font-medium">
            For teachers
          </span>
        </div>
        <p className="text-slate-500">
          StudLending risk parameters - model based on thesis by Sanin M.O.
        </p>
      </header>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-2xl font-bold text-slate-800">{pairs.length}</div>
          <div className="text-sm text-slate-400 mt-1">Total pairs</div>
        </div>
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
          <div className="text-2xl font-bold text-green-700">{allowedPairs}</div>
          <div className="text-sm text-green-600 mt-1">Admitted by model</div>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
          <div className="text-2xl font-bold text-red-700">{rejectedPairs}</div>
          <div className="text-sm text-red-600 mt-1">Rejected (ρ {"<"} 0.40)</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-2xl font-bold text-slate-800">{lendingAssets.length}</div>
          <div className="text-sm text-slate-400 mt-1">Active markets</div>
        </div>
      </div>

      {/* Model Parameters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Risk Model Parameters</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Admissibility criterion</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4"><span className="text-slate-500 flex-1">ρ_min (correlation)</span><span className="font-mono font-semibold text-right">0.40</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-500 flex-1">δ_max (quantile)</span><span className="font-mono font-semibold text-right">15%</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-500 flex-1">α (VaR level)</span><span className="font-mono font-semibold text-right">5%</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-500 flex-1">W (window)</span><span className="font-mono font-semibold text-right">90 days</span></div>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Base LTV parameters</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4"><span className="text-slate-500 flex-1">LTV_base</span><span className="font-mono font-semibold text-right">70%</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-500 flex-1">LT_base</span><span className="font-mono font-semibold text-right">80%</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-500 flex-1">κ_min</span><span className="font-mono font-semibold text-right">0.75</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-500 flex-1">Liquidation bonus</span><span className="font-mono font-semibold text-right">5%</span></div>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Interest rate model</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-4"><span className="text-slate-500 flex-1">r_0 (base rate)</span><span className="font-mono font-semibold text-right">2%</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-500 flex-1">s_1 (slope 1)</span><span className="font-mono font-semibold text-right">8%</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-500 flex-1">s_2 (slope 2)</span><span className="font-mono font-semibold text-right">30%</span></div>
              <div className="flex justify-between gap-4"><span className="text-slate-500 flex-1">U_k (kink point)</span><span className="font-mono font-semibold text-right">80%</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Pair Risk Matrix */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-700">Pair Risk Matrix</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Effective parameters after applying correlation analysis model
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Collateral</th>
                <th className="px-4 py-3 text-left font-medium">Debt</th>
                <th className="px-4 py-3 text-left font-medium">Risk</th>
                <th className="px-4 py-3 text-left font-medium">LTV eff.</th>
                <th className="px-4 py-3 text-left font-medium">LT eff.</th>
                <th className="px-4 py-3 text-left font-medium">Guard γ</th>
                <th className="px-4 py-3 text-left font-medium">a_cd</th>
                <th className="px-4 py-3 text-left font-medium">φ_cd</th>
                <th className="px-4 py-3 text-left font-medium">Epoch</th>
              </tr>
            </thead>
            <tbody>
              {pairs.map((pair, i) => {
                const cfg = pairData?.[i]?.result as any;
                if (!cfg) return null;
                return (
                  <tr key={pair.coll.address + pair.debt.address}
                    className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{pair.coll.symbol}</td>
                    <td className="px-4 py-3 text-slate-700">{pair.debt.symbol}</td>
                    <td className="px-4 py-3">{riskBadge(cfg.allowed, cfg.effectiveLtvBps)}</td>
                    <td className="px-4 py-3 font-mono text-slate-700">
                      {cfg.allowed ? (cfg.effectiveLtvBps / 100).toFixed(2) + "%" : "-"}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700">
                      {cfg.allowed ? (cfg.effectiveLiqThBps / 100).toFixed(2) + "%" : "-"}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700">
                      {(cfg.guardThresholdBps / 100).toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {(cfg.aCdBps / 10000).toFixed(3)}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {(cfg.phiCdBps / 10000).toFixed(3)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      {cfg.epoch.toString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Market States */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-700">Market States</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Актив</th>
                <th className="px-4 py-3 text-left font-medium">Liquidity</th>
                <th className="px-4 py-3 text-left font-medium">Debt</th>
                <th className="px-4 py-3 text-left font-medium">Utilization</th>
                <th className="px-4 py-3 text-left font-medium">Borrow APR</th>
                <th className="px-4 py-3 text-left font-medium">Borrow Index</th>
              </tr>
            </thead>
            <tbody>
              {lendingAssets.map((asset, i) => {
                const m = markets?.[i]?.result as any;
                const r = rates?.[i]?.result as bigint | undefined;
                if (!m) return null;
                const debt = Number(m.totalScaledDebt) * Number(m.borrowIndexRay) / Number(RAY);
                const total = debt + Number(m.totalLiquidityShares);
                const util = total > 0 ? (debt / total * 100).toFixed(1) : "0.0";
                const apr = r ? (Number(r) / Number(RAY) * 100).toFixed(2) : "-";
                const idx = (Number(m.borrowIndexRay) / Number(RAY)).toFixed(6);
                return (
                  <tr key={asset.address} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{asset.symbol}</td>
                    <td className="px-4 py-3 font-mono text-slate-700">
                      {(Number(m.totalLiquidityShares) / 1e18).toFixed(4)}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700">
                      {(debt / 1e18).toFixed(6)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: util + "%" }} />
                        </div>
                        <span className="font-mono text-slate-600">{util}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700">{apr}%</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{idx}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-slate-400 text-center">
        Risk updater runs hourly. Pair parameters updated based on price correlation analysis.
        Model: thesis by Sanin M.O., NaUKMA 2025.
      </div>
    </div>
  );
}
