"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import { sepolia } from "wagmi/chains";
import {
  LENDING_CORE_ADDRESS,
  PAIR_REGISTRY_ADDRESS,
  lendingAssets,
  lendingCoreAbi,
  pairRegistryAbi,
} from "../../lib/lending-contracts";

const UNISWAP_V2_ROUTER = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3" as const;
const WETH_ADDR = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14" as const;
const RAY = BigInt("1000000000000000000000000000");

const erc20Abi = [
  { name: "approve",   type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ type: "bool" }] },
  { name: "allowance", type: "function", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    outputs: [{ type: "uint256" }] },
  { name: "balanceOf", type: "function", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }] },
] as const;

const swapAbi = [{
  name: "swapExactETHForTokens", type: "function", stateMutability: "payable",
  inputs: [
    { name: "amountOutMin", type: "uint256" },
    { name: "path",         type: "address[]" },
    { name: "to",           type: "address" },
    { name: "deadline",     type: "uint256" },
  ],
  outputs: [{ type: "uint256[]" }],
}] as const;

type Step = "approve" | "deposit" | "borrow" | "swap" | "done";

const collateralAssets = lendingAssets.filter(a => a.symbol !== "ETH");
const ETH_ASSET = lendingAssets.find(a => a.symbol === "ETH")!;

export default function LeveragePage() {
  const { address, isConnected } = useAccount();
  const [collToken, setCollToken]     = useState(collateralAssets[0].address);
  const [collAmount, setCollAmount]   = useState("");
  const [borrowAmt,  setBorrowAmt]    = useState("");
  const [step, setStep]               = useState<Step>("approve");
  const [borrowedEth, setBorrowedEth] = useState<bigint>(BigInt(0));

  const collAsset      = collateralAssets.find(a => a.address === collToken)!;
  const collAmountWei  = collAmount && parseFloat(collAmount) > 0 ? parseUnits(collAmount, collAsset.decimals) : BigInt(0);
  const borrowAmtWei   = borrowAmt  && parseFloat(borrowAmt)  > 0 ? parseUnits(borrowAmt,  18) : BigInt(0);

  const leverageRatio = collAmount && borrowAmt && parseFloat(collAmount) > 0
    ? (1 + parseFloat(borrowAmt) / parseFloat(collAmount)).toFixed(2) : "1.00";
  const ltvPct = collAmount && borrowAmt && parseFloat(collAmount) > 0
    ? Math.min(parseFloat(borrowAmt) / parseFloat(collAmount) * 100, 99).toFixed(1) : "0";

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: collToken as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, LENDING_CORE_ADDRESS] : undefined,
    query: { enabled: !!address && !!collToken },
  });
  const { data: collBalance } = useReadContract({
    address: collToken as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!collToken },
  });
  const { data: ethBalance } = useBalance({ address, query: { enabled: !!address } });
  const { data: pairConfig } = useReadContract({
    address: PAIR_REGISTRY_ADDRESS,
    abi: pairRegistryAbi,
    functionName: "getPairConfig",
    args: [collToken as `0x${string}`, ETH_ASSET.address],
    query: { enabled: !!collToken },
  });
  const { data: position } = useReadContract({
    address: LENDING_CORE_ADDRESS,
    abi: lendingCoreAbi,
    functionName: "positions",
    args: address ? [address, collToken as `0x${string}`, ETH_ASSET.address] : undefined,
    query: { enabled: !!address && !!collToken },
  });
  const { data: hfRay } = useReadContract({
    address: LENDING_CORE_ADDRESS,
    abi: lendingCoreAbi,
    functionName: "getHealthFactor",
    args: address ? [address, collToken as `0x${string}`, ETH_ASSET.address] : undefined,
    query: { enabled: !!address && !!collToken },
  });

  const hf = hfRay ? (Number(hfRay as bigint) / Number(RAY)).toFixed(2) : null;
  const needsApprove = !allowance || (allowance as bigint) < collAmountWei;
  const pairAllowed  = pairConfig && (pairConfig as any).allowed;
  const ltvBps       = pairConfig ? (pairConfig as any).effectiveLtvBps : 0;
  const maxLeverage  = ltvBps ? (10000 / (10000 - ltvBps)).toFixed(1) : "—";

  const { writeContract, data: txHash, isPending, error: writeError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const isBusy = isPending || isConfirming;

  useEffect(() => {
    if (!isSuccess) return;
    refetchAllowance();
    if (step === "approve")  { setStep("deposit"); reset(); }
    else if (step === "deposit") { setStep("borrow");  reset(); }
    else if (step === "borrow")  { setBorrowedEth(borrowAmtWei); setStep("swap"); reset(); }
    else if (step === "swap")    { setStep("done");    reset(); }
  }, [isSuccess]);

  useEffect(() => {
    if (!needsApprove && step === "approve") setStep("deposit");
  }, [needsApprove]);

  function handleApprove() {
    writeContract({ address: collToken as `0x${string}`, abi: erc20Abi,
      functionName: "approve", args: [LENDING_CORE_ADDRESS, collAmountWei],
      chain: sepolia, account: address });
  }
  function handleDeposit() {
    writeContract({ address: LENDING_CORE_ADDRESS, abi: lendingCoreAbi,
      functionName: "depositCollateral",
      args: [collToken as `0x${string}`, ETH_ASSET.address, collAmountWei],
      gas: BigInt(300000), chain: sepolia, account: address });
  }
  function handleBorrow() {
    writeContract({ address: LENDING_CORE_ADDRESS, abi: lendingCoreAbi,
      functionName: "borrow",
      args: [collToken as `0x${string}`, ETH_ASSET.address, borrowAmtWei],
      gas: BigInt(300000), chain: sepolia, account: address });
  }
  function handleSwap() {
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
    writeContract({ address: UNISWAP_V2_ROUTER, abi: swapAbi,
      functionName: "swapExactETHForTokens",
      args: [BigInt(0), [WETH_ADDR, collToken as `0x${string}`], address!, deadline],
      value: borrowedEth > BigInt(0) ? borrowedEth : borrowAmtWei,
      gas: BigInt(300000), chain: sepolia, account: address });
  }

  const steps: { id: Step; label: string; desc: string }[] = [
    { id: "approve",  label: `Approve ${collAsset.symbol}`,   desc: `Allow the protocol to use ${collAsset.symbol}` },
    { id: "deposit",  label: `Deposit ${collAsset.symbol}`,   desc: "Deposit collateral into the lending protocol" },
    { id: "borrow",   label: "Borrow ETH",                     desc: "Borrow ETH against collateral" },
    { id: "swap",     label: `Buy more ${collAsset.symbol}`,   desc: `Купити більше ${collAsset.symbol} на позичений ETH` },
  ];
  const stepIndex = steps.findIndex(s => s.id === step);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-800">Leveraged Trading</h1>
        <p className="text-slate-500">Open a leveraged position via the lending protocol</p>
      </header>

      {!isConnected && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Connect your wallet to start leveraged trading.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-semibold text-slate-700">Position Parameters</h2>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-600">Collateral Token</label>
            <select value={collToken}
              onChange={e => { setCollToken(e.target.value); setStep("approve"); reset(); }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
              {collateralAssets.map(a => (
                <option key={a.address} value={a.address}>{a.name} ({a.symbol})</option>
              ))}
            </select>
            {collBalance !== undefined && (
              <p className="text-xs text-slate-400">
                Balance: {parseFloat(formatUnits(collBalance as bigint, collAsset.decimals)).toFixed(4)} {collAsset.symbol}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-600">Collateral Amount ({collAsset.symbol})</label>
            <input type="number" min="0" placeholder="0.0" value={collAmount}
              onChange={e => { setCollAmount(e.target.value); setStep(needsApprove ? "approve" : "deposit"); reset(); }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-600">Borrow Amount (ETH)</label>
            <input type="number" min="0" placeholder="0.0" value={borrowAmt}
              onChange={e => setBorrowAmt(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            {ethBalance && (
              <p className="text-xs text-slate-400">ETH Balance: {parseFloat(ethBalance.formatted).toFixed(4)} ETH</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-center">
              <p className="text-xs text-blue-500 font-medium">Плече</p>
              <p className="text-xl font-bold text-blue-700">{leverageRatio}x</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
              <p className="text-xs text-slate-500 font-medium">LTV</p>
              <p className="text-xl font-bold text-slate-700">{ltvPct}%</p>
            </div>
            <div className={`rounded-xl border p-3 text-center ${hf && parseFloat(hf) < 1.2 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-100"}`}>
              <p className={`text-xs font-medium ${hf && parseFloat(hf) < 1.2 ? "text-red-500" : "text-green-500"}`}>Health</p>
              <p className={`text-xl font-bold ${hf && parseFloat(hf) < 1.2 ? "text-red-700" : "text-green-700"}`}>{hf ?? "—"}</p>
            </div>
          </div>

          {pairAllowed !== undefined && !pairAllowed && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              This trading pair is not permitted by the protocol.
            </div>
          )}
          {ltvBps > 0 && (
            <p className="text-xs text-slate-400">Max leverage: <span className="font-semibold">{maxLeverage}x</span> (LTV {(ltvBps / 100).toFixed(0)}%)</p>
          )}

          <div className="space-y-2 pt-1">
            {step === "done" ? (
              <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-green-800">Position opened!</p>
                  <p className="text-sm text-green-700 mt-0.5">
                    Collateral: {collAmount} {collAsset.symbol} · Debt: {borrowAmt} ETH · Плече: {leverageRatio}x
                  </p>
                  {txHash && (
                    <a href={"https://sepolia.etherscan.io/tx/" + txHash} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-green-600 underline mt-1 block">View transaction</a>
                  )}
                  <button onClick={() => { setStep("approve"); setCollAmount(""); setBorrowAmt(""); reset(); }}
                    className="mt-2 text-xs text-green-700 underline">Open new position</button>
                </div>
              </div>
            ) : (
              <>
                {step === "approve" && needsApprove && (
                  <button onClick={handleApprove}
                    disabled={!collAmount || !address || isBusy || !pairAllowed}
                    className="w-full rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white disabled:opacity-40 hover:bg-blue-400">
                    {isBusy ? "Processing..." : `1. Approve ${collAsset.symbol}`}
                  </button>
                )}
                {step === "deposit" && (
                  <button onClick={handleDeposit}
                    disabled={!collAmount || !address || isBusy}
                    className="w-full rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white disabled:opacity-40 hover:bg-blue-400">
                    {isBusy ? "Processing..." : `2. Внести ${collAmount || "0"} ${collAsset.symbol} as collateral`}
                  </button>
                )}
                {step === "borrow" && (
                  <button onClick={handleBorrow}
                    disabled={!borrowAmt || !address || isBusy}
                    className="w-full rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white disabled:opacity-40 hover:bg-purple-500">
                    {isBusy ? "Processing..." : `3. Позичити ${borrowAmt || "0"} ETH`}
                  </button>
                )}
                {step === "swap" && (
                  <button onClick={handleSwap}
                    disabled={!address || isBusy}
                    className="w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white disabled:opacity-40 hover:bg-green-500">
                    {isBusy ? "Processing..." : `4. Купити більше ${collAsset.symbol} на ${borrowAmt} ETH`}
                  </button>
                )}
              </>
            )}
          </div>

          {writeError && (
            <p className="text-xs text-red-500 break-all">{(writeError as any).shortMessage ?? writeError.message}</p>
          )}
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-lg font-semibold text-slate-700">Steps</h2>
            {steps.map((s, i) => {
              const done    = step === "done" || i < stepIndex;
              const current = s.id === step && step !== "done";
              return (
                <div key={s.id} className={`flex items-center gap-3 rounded-xl p-3 ${current ? "bg-blue-50 border border-blue-200" : done ? "bg-green-50" : "bg-slate-50"}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${done ? "bg-green-500 text-white" : current ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-500"}`}>
                    {done ? "✓" : i + 1}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${done ? "text-green-700" : current ? "text-blue-700" : "text-slate-500"}`}>{s.label}</p>
                    <p className="text-xs text-slate-400">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </section>

          {position && (position as any).collateralAmount > BigInt(0) && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <h2 className="text-lg font-semibold text-slate-700">Open Position</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Застава</span>
                  <span className="font-medium">{formatUnits((position as any).collateralAmount, collAsset.decimals)} {collAsset.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Debt</span>
                  <span className="font-medium">{formatUnits((position as any).scaledDebt, 18)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Health Factor</span>
                  <span className={`font-bold ${hf && parseFloat(hf) < 1.2 ? "text-red-600" : "text-green-600"}`}>{hf ?? "—"}</span>
                </div>
              </div>
              {hf && parseFloat(hf) < 1.5 && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
                  Health Factor is close to the liquidation threshold. Consider repaying part of the debt.
                </div>
              )}
            </section>
          )}

          <section className="rounded-2xl border border-slate-100 bg-slate-50 p-5 space-y-2">
            <h3 className="text-sm font-semibold text-slate-600">How does leverage work?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong>2x Leverage Example:</strong> Вносите 1 WBTC as collateral, позичаєте ETH вартістю 1 WBTC, купуєте ще 1 WBTC. Якщо ціна зросте на 10% — ви заробите 20%.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong>Risk:</strong> При падінні ціни Health Factor знижується. При HF {"<"} 1.0 the position is liquidated.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
