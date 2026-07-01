"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { sepolia } from "wagmi/chains";
import {
  LENDING_CORE_ADDRESS,
  lendingAssets,
  lendingCoreAbi,
} from "../../../lib/lending-contracts";

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

const RAY = BigInt("1000000000000000000000000000");

export default function SupplyPage() {
  const { address } = useAccount();
  const [asset, setAsset] = useState(lendingAssets[3].address); // ETH default
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState("approve");
  const [txMsg, setTxMsg] = useState("");

  const assetInfo = lendingAssets.find(a => a.address === asset)!;

  const { data: balance } = useReadContract({
    address: asset,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: asset,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, LENDING_CORE_ADDRESS] : undefined,
    query: { enabled: !!address, refetchInterval: 3000 },
  });

  const { data: market } = useReadContract({
    address: LENDING_CORE_ADDRESS,
    abi: lendingCoreAbi,
    functionName: "marketStates",
    args: [asset],
    query: { refetchInterval: 5000 },
  });

  const { data: rateRay } = useReadContract({
    address: LENDING_CORE_ADDRESS,
    abi: lendingCoreAbi,
    functionName: "getBorrowRate",
    args: [asset],
    query: { refetchInterval: 5000 },
  });

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isSuccess, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });
  const isBusy = isPending || isConfirming;

  useEffect(() => {
    if (isSuccess) {
      refetchAllowance();
      if (step === "approve") { setStep("supply"); setTxMsg("Approved! Now supply."); }
      else if (step === "supply") { setStep("done"); setTxMsg("Supplied successfully! Earning interest."); }
    }
  }, [isSuccess]);

  const amountWei = amount ? parseUnits(amount, 18) : BigInt(0);
  const needsApprove = !allowance || (allowance as bigint) < amountWei;
  const hasBalance = balance !== undefined && (balance as bigint) >= amountWei && amountWei > BigInt(0);
  const canProceed = hasBalance && !!amount;

  const m = market as any;
  const totalLiquidity = m ? parseFloat(formatUnits(m.totalLiquidityShares, 18)).toFixed(4) : "—";
  const totalDebt = m ? Number(m.totalScaledDebt) * Number(m.borrowIndexRay) / Number(RAY) : 0;
  const total = m ? totalDebt + Number(m.totalLiquidityShares) : 0;
  const utilPct = total > 0 ? (totalDebt / total * 100).toFixed(1) : "0.0";

  const borrowApr = rateRay ? (Number(rateRay as bigint) / Number(RAY) * 100).toFixed(2) : "0";
  const supplyApr = rateRay && m
    ? (Number(rateRay as bigint) / Number(RAY) * (parseFloat(utilPct) / 100) * 0.9 * 100).toFixed(2)
    : "0";

  function handleApprove() {
    writeContract({
      address: asset,
      abi: erc20Abi,
      functionName: "approve",
      args: [LENDING_CORE_ADDRESS, BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935")], // max uint256
      chain: sepolia,
      account: address!,
      gas: BigInt(100000),
    });
    setStep("approve");
  }

  function handleSupply() {
    writeContract({
      address: LENDING_CORE_ADDRESS,
      abi: lendingCoreAbi,
      functionName: "supplyLiquidity",
      args: [asset, amountWei],
      chain: sepolia,
      account: address!,
      gas: BigInt(200000),
    });
    setStep("supply");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-10">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">Supply Liquidity</h1>
        <p className="text-slate-500 mt-1">Provide liquidity and earn interest from borrowers</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Asset</label>
            <select
              value={asset}
              onChange={e => { setAsset(e.target.value as `0x${string}`); setStep("approve"); setTxMsg(""); }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
            >
              {lendingAssets.map(a => (
                <option key={a.address} value={a.address}>{a.symbol} — {a.name}</option>
              ))}
            </select>
            {balance !== undefined && (
              <p className="text-xs text-slate-400">
                Баланс: {parseFloat(formatUnits(balance as bigint, 18)).toFixed(4)} {assetInfo.symbol}
              </p>
            )}
            <input
              type="number"
              min="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Amount"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
            />
            <button
              onClick={() => balance && setAmount(formatUnits(balance as bigint, 18))}
              className="text-xs text-blue-600 hover:underline"
            >
              Max
            </button>
          </div>

          {amount && !hasBalance && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              Insufficient balance
            </div>
          )}
          {txMsg && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700">
              {txMsg}
            </div>
          )}

          {step !== "done" && (
            <div className="space-y-3">
              {needsApprove && (
                <button
                  onClick={handleApprove}
                  disabled={!canProceed || isBusy}
                  className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white disabled:opacity-40 hover:bg-blue-500"
                >
                  {isConfirming ? "Confirming..." : isPending ? "Signing..." : "1. Approve"}
                </button>
              )}
              {!needsApprove && (
                <button
                  onClick={handleSupply}
                  disabled={!canProceed || isBusy}
                  className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white disabled:opacity-40 hover:bg-green-500"
                >
                  {isConfirming ? "Confirming..." : isPending ? "Signing..." : "2. Supply"}
                </button>
              )}
            </div>
          )}

          {step === "done" && (
            <button
              onClick={() => { setStep("approve"); setTxMsg(""); setAmount(""); }}
              className="w-full rounded-xl border border-slate-200 py-3 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Supply more
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-700">Market Info</h2>
          <div className="space-y-3 text-sm">
            <Row label="Total Liquidity">{totalLiquidity} {assetInfo.symbol}</Row>
            <Row label="Utilization">{utilPct}%</Row>
            <Row label="Borrow APR">{borrowApr}%</Row>
            <Row label="Supply APR">
              <span className="text-green-600 font-semibold">{supplyApr}%</span>
            </Row>
          </div>
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-700 mt-4">
            Supply APR = Borrow APR × Utilization × (1 − reserve factor 10%)
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
