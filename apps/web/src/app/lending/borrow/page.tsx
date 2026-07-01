"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { sepolia } from "wagmi/chains";
import {
  LENDING_CORE_ADDRESS,
  PAIR_REGISTRY_ADDRESS,
  lendingAssets,
  lendingCoreAbi,
  pairRegistryAbi,
} from "../../../lib/lending-contracts";

const RAY = BigInt("1000000000000000000000000000");

const erc20Abi = [
  { name: "approve", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ type: "bool" }] },
  { name: "balanceOf", type: "function", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }] },
  { name: "allowance", type: "function", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    outputs: [{ type: "uint256" }] },
] as const;



export default function BorrowPage() {
  const { address, isConnected } = useAccount();
  const [collateral, setCollateral] = useState(lendingAssets[0].address);
  const [debtAsset,  setDebtAsset]  = useState(lendingAssets[3].address); // ETH
  const [collAmount, setCollAmount] = useState("");
  const [borrowAmt,  setBorrowAmt]  = useState("");
  const [step, setStep] = useState<string>("approve");
  const [txMsg, setTxMsg] = useState("");

  const collAsset = lendingAssets.find(a => a.address === collateral)!;
  const debtAst   = lendingAssets.find(a => a.address === debtAsset)!;

  // Читаємо пару з PairRegistry
  const { data: pairConfig } = useReadContract({
    address: PAIR_REGISTRY_ADDRESS,
    abi: pairRegistryAbi,
    functionName: "getPairConfig",
    args: [collateral, debtAsset],
    query: { enabled: !!collateral && !!debtAsset },
  });

  // Баланс застави
  const { data: collBalance } = useReadContract({
    address: collateral,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: collateral,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, LENDING_CORE_ADDRESS] : undefined,
    query: { enabled: !!address, refetchInterval: 3000 },
  });

  // HF після операції
  const { data: hfRay } = useReadContract({
    address: LENDING_CORE_ADDRESS,
    abi: lendingCoreAbi,
    functionName: "getHealthFactor",
    args: address ? [address, collateral, debtAsset] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  // Liquidation price
  const { data: liqPriceRay } = useReadContract({
    address: LENDING_CORE_ADDRESS,
    abi: lendingCoreAbi,
    functionName: "getLiquidationPrice",
    args: address ? [address, collateral, debtAsset] : undefined,
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  // Guard active?
  const { data: guardActive } = useReadContract({
    address: LENDING_CORE_ADDRESS,
    abi: lendingCoreAbi,
    functionName: "isGuardActive",
    args: [collateral, debtAsset],
    query: { refetchInterval: 10000 },
  });

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });
  const isBusy = isPending || isConfirming;

  useEffect(() => {
    if (isSuccess) {
      refetchAllowance();
      if (step === 'approve') { setStep("deposit"); setTxMsg("Approved! Now deposit collateral."); }
      else if (step === 'deposit') { setStep("borrow"); setTxMsg("Collateral deposited! Now borrow."); }
      else if (step === 'borrow') { setStep("done"); setTxMsg("Borrowed successfully!"); }
    }
  }, [isSuccess]);

  const cfg = pairConfig as any;
  const allowed     = cfg?.allowed ?? false;
  const ltvBps      = cfg?.effectiveLtvBps ?? 0;
  const ltBps       = cfg?.effectiveLiqThBps ?? 0;
  const guardBps    = cfg?.guardThresholdBps ?? 0;

  const collAmtWei  = collAmount ? parseUnits(collAmount, 18) : BigInt(0);
  const needsApprove = !allowance || (allowance as bigint) < collAmtWei;
  const hasCollBalance = collBalance !== undefined && (collBalance as bigint) >= collAmtWei && collAmtWei > BigInt(0);
  const canProceed = hasCollBalance && !!collAmount;

  const hf = hfRay ? Number(hfRay as bigint) / Number(RAY) : null;
  const liqPrice = liqPriceRay ? Number(formatUnits(liqPriceRay as bigint, 18)) : null;

  function hfColor(hf: number | null) {
    if (!hf || hf > 999) return "text-slate-400";
    if (hf >= 1.5) return "text-green-600";
    if (hf >= 1.1) return "text-amber-500";
    return "text-red-600";
  }

  function handleApprove() {
    if (!collAmount) return;
    writeContract({
      address: collateral,
      abi: erc20Abi,
      functionName: "approve",
      args: [LENDING_CORE_ADDRESS, collAmtWei],
      chain: sepolia,
      account: address!,
      gas: BigInt(100000),
    });
    setStep("approve");
  }

  function handleDeposit() {
    if (!collAmount) return;
    writeContract({
      address: LENDING_CORE_ADDRESS,
      abi: lendingCoreAbi,
      functionName: "depositCollateral",
      args: [collateral, debtAsset, collAmtWei],
      chain: sepolia,
      account: address!,
      gas: BigInt(300000),
    });
    setStep("deposit");
  }

  function handleBorrow() {
    if (!borrowAmt) return;
    writeContract({
      address: LENDING_CORE_ADDRESS,
      abi: lendingCoreAbi,
      functionName: "borrow",
      args: [collateral, debtAsset, parseUnits(borrowAmt, 18)],
      chain: sepolia,
      account: address!,
      gas: BigInt(400000),
    });
    setStep("borrow");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-10">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">Borrow</h1>
        <p className="text-slate-500 mt-1">Deposit collateral and borrow assets</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">

        {/* Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">

          {/* Collateral */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Collateral</label>
            <select
              value={collateral}
              onChange={e => { setCollateral(e.target.value as `0x${string}`); setStep("approve"); }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
            >
              {lendingAssets.map(a => (
                <option key={a.address} value={a.address}>{a.symbol} — {a.name}</option>
              ))}
            </select>
            {collBalance !== undefined && (
              <p className="text-xs text-slate-400">
                Баланс: {parseFloat(formatUnits(collBalance as bigint, 18)).toFixed(4)} {collAsset.symbol}
              </p>
            )}
            <input
              type="number"
              min="0"
              value={collAmount}
              onChange={e => setCollAmount(e.target.value)}
              placeholder="Collateral amount"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
            />
          </div>

          {/* Debt */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Borrow</label>
            <select
              value={debtAsset}
              onChange={e => { setDebtAsset(e.target.value as `0x${string}`); setStep("approve"); }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
            >
              {lendingAssets.filter(a => a.address !== collateral).map(a => (
                <option key={a.address} value={a.address}>{a.symbol} — {a.name}</option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              value={borrowAmt}
              onChange={e => setBorrowAmt(e.target.value)}
              placeholder="Borrow amount"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
            />
          </div>

          {/* Guard warning */}
          {collAmount && !hasCollBalance && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              Insufficient collateral balance
            </div>
          )}
          {guardActive && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              ⚠️ Guard active — sharp collateral price drop. New borrows are blocked.
            </div>
          )}

          {/* Pair not allowed */}
          {!allowed && cfg && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
              This pair is rejected by the risk model (low correlation or high volatility)
            </div>
          )}

          {/* Tx message */}
          {txMsg && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700">
              {txMsg}
            </div>
          )}

          {/* Steps */}
          {allowed && step !== 'done' && (
            <div className="space-y-3">
              {needsApprove && step === 'approve' && (
                <button
                  onClick={handleApprove}
                  disabled={!canProceed || isBusy}
                  className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:opacity-40 hover:bg-blue-500"
                >
                  {isConfirming ? "Confirming..." : isPending ? "Signing..." : "1. Approve Collateral"}
                </button>
              )}
              {(!needsApprove || step === 'deposit') && step !== 'borrow' && step !== 'done' && (
                <button
                  onClick={handleDeposit}
                  disabled={!canProceed || isBusy}
                  className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:opacity-40 hover:bg-blue-500"
                >
                  {isConfirming ? "Confirming..." : isPending ? "Signing..." : "2. Deposit Collateral"}
                </button>
              )}
              {step === 'borrow' && (
                <button
                  onClick={handleBorrow}
                  disabled={!borrowAmt || isBusy || !allowed}
                  className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white disabled:opacity-40 hover:bg-green-500"
                >
                  {isConfirming ? "Confirming..." : isPending ? "Signing..." : "3. Borrow"}
                </button>
              )}
            </div>
          )}

          {step === 'done' && (
            <button
              onClick={() => { setStep("approve"); setTxMsg(""); setBorrowAmt(""); setCollAmount(""); }}
              className="w-full rounded-xl border border-slate-200 py-3 font-semibold text-slate-600 hover:bg-slate-50"
            >
              New position
            </button>
          )}
        </div>

        {/* Position Preview */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-slate-700">Pair Parameters</h2>
            <div className="space-y-3 text-sm">
              <Row label="Pair">{collAsset.symbol} / {debtAst.symbol}</Row>
              <Row label="Allowed">
                <span className={allowed ? "text-green-600" : "text-red-500"}>
                  {allowed ? "✓ Так" : "✗ Ні"}
                </span>
              </Row>
              <Row label="Effective LTV">{ltvBps ? (ltvBps / 100).toFixed(2) + "%" : "—"}</Row>
              <Row label="Liquidation Threshold">{ltBps ? (ltBps / 100).toFixed(2) + "%" : "—"}</Row>
              <Row label="Guard threshold">{guardBps ? (guardBps / 100).toFixed(2) + "%" : "—"}</Row>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-slate-700">My Position</h2>
            <div className="space-y-3 text-sm">
              <Row label="Health Factor">
                <span className={"font-bold text-lg " + hfColor(hf)}>
                  {hf && hf < 999 ? hf.toFixed(3) : "—"}
                </span>
              </Row>
              <Row label="Liquidation price">
                {liqPrice && liqPrice > 0
                  ? liqPrice.toFixed(6) + " " + debtAst.symbol + "/" + collAsset.symbol
                  : "—"}
              </Row>
              <Row label="Guard active">
                <span className={guardActive ? "text-red-600" : "text-green-600"}>
                  {guardActive ? "⚠️ Так" : "✓ Ні"}
                </span>
              </Row>
            </div>

            {hf && hf < 999 && hf < 1.5 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
                HF below 1.5 — liquidation risk if collateral price drops
              </div>
            )}
          </div>
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
