"use client";

import { useState } from "react";
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits, parseUnits, isAddress } from "viem";
import { sepolia } from "wagmi/chains";
import {
  LENDING_CORE_ADDRESS,
  lendingAssets,
  lendingCoreAbi,
} from "../../../lib/lending-contracts";

const RAY = BigInt("1000000000000000000000000000");

const erc20Abi = [
  { name: "approve", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ type: "bool" }] },
  { name: "allowance", type: "function", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    outputs: [{ type: "uint256" }] },
] as const;

export default function LiquidatePage() {
  const { address } = useAccount();
  const [borrower, setBorrower] = useState("");
  const [collateral, setCollateral] = useState(lendingAssets[0].address);
  const [debtAsset, setDebtAsset] = useState(lendingAssets[3].address);
  const [repayAmt, setRepayAmt] = useState("");
  const [searched, setSearched] = useState(false);
  const [txMsg, setTxMsg] = useState("");
  const [step, setStep] = useState("approve");

  const validBorrower = isAddress(borrower);

  const collInfo = lendingAssets.find(a => a.address === collateral)!;
  const debtInfo  = lendingAssets.find(a => a.address === debtAsset)!;

  // Позиція позичальника
  const { data: pos } = useReadContract({
    address: LENDING_CORE_ADDRESS,
    abi: lendingCoreAbi,
    functionName: "positions",
    args: validBorrower ? [borrower as `0x${string}`, collateral, debtAsset] : undefined,
    query: { enabled: validBorrower && searched, refetchInterval: 5000 },
  });

  // HF позичальника
  const { data: hfRay } = useReadContract({
    address: LENDING_CORE_ADDRESS,
    abi: lendingCoreAbi,
    functionName: "getHealthFactor",
    args: validBorrower ? [borrower as `0x${string}`, collateral, debtAsset] : undefined,
    query: { enabled: validBorrower && searched, refetchInterval: 5000 },
  });

  // Market state для розрахунку боргу
  const { data: market } = useReadContract({
    address: LENDING_CORE_ADDRESS,
    abi: lendingCoreAbi,
    functionName: "marketStates",
    args: [debtAsset],
    query: { refetchInterval: 5000 },
  });

  // Allowance ліквідатора
  const { data: allowance, refetch: refetchAllow } = useReadContract({
    address: debtAsset,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, LENDING_CORE_ADDRESS] : undefined,
    query: { enabled: !!address, refetchInterval: 3000 },
  });

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });
  const isBusy = isPending || isConfirming;

  const p = pos as any;
  const m = market as any;
  const hf = hfRay ? Number(hfRay as bigint) / Number(RAY) : null;
  const isLiquidatable = hf !== null && hf < 1.0;

  const currentDebt = p && m
    ? Number(p.scaledDebt) * Number(m.borrowIndexRay) / Number(RAY) / 1e18
    : 0;
  const maxRepay = currentDebt * 0.5; // 50% close factor

  const repayWei = repayAmt ? parseUnits(repayAmt, 18) : BigInt(0);
  const needsApprove = !allowance || (allowance as bigint) < repayWei;

  // Bonus 5% — скільки застави отримає ліквідатор
  const collateralToReceive = repayAmt && hf
    ? (parseFloat(repayAmt) * 1.05).toFixed(6)
    : "—";

  function handleApprove() {
    if (!repayAmt) return;
    writeContract({
      address: debtAsset,
      abi: erc20Abi,
      functionName: "approve",
      args: [LENDING_CORE_ADDRESS, repayWei],
      chain: sepolia,
      account: address!,
      gas: BigInt(100000),
    });
    setStep("liquidate");
  }

  function handleLiquidate() {
    if (!repayAmt || !validBorrower) return;
    writeContract({
      address: LENDING_CORE_ADDRESS,
      abi: lendingCoreAbi,
      functionName: "liquidate",
      args: [borrower as `0x${string}`, collateral, debtAsset, repayWei],
      chain: sepolia,
      account: address!,
      gas: BigInt(400000),
    });
    setTxMsg("Liquidation submitted!");
  }

  function hfColor(hf: number) {
    if (hf >= 1.5) return "text-green-600";
    if (hf >= 1.1) return "text-amber-500";
    return "text-red-600";
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-10">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">Liquidate</h1>
        <p className="text-slate-500 mt-1">
          Ліквідуйте нездорові позиції та отримайте 5% бонус від застави
        </p>
      </header>

      {/* Info */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-700 space-y-1">
        <p className="font-semibold">Як працює ліквідація:</p>
        <p>1. Знайдіть позицію з HF {"<"} 1.0</p>
        <p>2. Погасіть до 50% боргу позичальника (close factor)</p>
        <p>3. Отримайте відповідну заставу + 5% бонус</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Search */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-semibold text-slate-700">Пошук позиції</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Адреса позичальника</label>
            <input
              value={borrower}
              onChange={e => { setBorrower(e.target.value); setSearched(false); }}
              placeholder="0x..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Застава</label>
            <select
              value={collateral}
              onChange={e => setCollateral(e.target.value as `0x${string}`)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
            >
              {lendingAssets.map(a => (
                <option key={a.address} value={a.address}>{a.symbol}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Актив боргу</label>
            <select
              value={debtAsset}
              onChange={e => setDebtAsset(e.target.value as `0x${string}`)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
            >
              {lendingAssets.filter(a => a.address !== collateral).map(a => (
                <option key={a.address} value={a.address}>{a.symbol}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setSearched(true)}
            disabled={!validBorrower}
            className="w-full rounded-xl bg-slate-800 py-3 font-semibold text-white disabled:opacity-40 hover:bg-slate-700"
          >
            Знайти позицію
          </button>
        </div>

        {/* Position Info */}
        <div className="space-y-4">
          {searched && p && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-slate-700">Позиція позичальника</h2>
              <div className="space-y-3 text-sm">
                <Row label="Застава">
                  {p.collateralAmount > 0
                    ? parseFloat(formatUnits(p.collateralAmount, 18)).toFixed(4) + " " + collInfo.symbol
                    : "—"}
                </Row>
                <Row label="Борг">
                  {currentDebt > 0 ? currentDebt.toFixed(6) + " " + debtInfo.symbol : "—"}
                </Row>
                <Row label="Макс. погашення">
                  {maxRepay > 0 ? maxRepay.toFixed(6) + " " + debtInfo.symbol : "—"}
                </Row>
                <Row label="Health Factor">
                  {hf !== null ? (
                    <span className={"font-bold text-xl " + hfColor(hf)}>
                      {hf.toFixed(3)}
                    </span>
                  ) : "—"}
                </Row>
                <Row label="Ліквідовувана">
                  <span className={isLiquidatable ? "text-red-600 font-semibold" : "text-green-600"}>
                    {isLiquidatable ? "⚠️ Так" : "✓ Ні (HF ≥ 1.0)"}
                  </span>
                </Row>
              </div>
            </div>
          )}

          {searched && isLiquidatable && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-slate-700">Ліквідація</h2>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">
                  Сума погашення (макс. {maxRepay.toFixed(6)} {debtInfo.symbol})
                </label>
                <input
                  type="number"
                  min="0"
                  max={maxRepay}
                  value={repayAmt}
                  onChange={e => setRepayAmt(e.target.value)}
                  placeholder="Кількість"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
                />
                <button
                  onClick={() => setRepayAmt(maxRepay.toFixed(6))}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Max (50%)
                </button>
              </div>

              {repayAmt && (
                <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700">
                  Ви отримаєте ~{collateralToReceive} {collInfo.symbol} (борг + 5% бонус)
                </div>
              )}

              {txMsg && (
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700">
                  {txMsg}
                </div>
              )}

              <div className="space-y-3">
                {needsApprove && (
                  <button
                    onClick={handleApprove}
                    disabled={!repayAmt || isBusy}
                    className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:opacity-40 hover:bg-blue-500"
                  >
                    {isConfirming ? "Підтвердження..." : isPending ? "Підпис..." : "1. Approve"}
                  </button>
                )}
                {!needsApprove && (
                  <button
                    onClick={handleLiquidate}
                    disabled={!repayAmt || isBusy}
                    className="w-full rounded-xl bg-red-600 py-3 font-semibold text-white disabled:opacity-40 hover:bg-red-500"
                  >
                    {isConfirming ? "Підтвердження..." : isPending ? "Підпис..." : "2. Liquidate"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-700 font-medium">{children}</span>
    </div>
  );
}
