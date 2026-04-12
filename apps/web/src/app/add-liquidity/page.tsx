"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { sepolia } from "wagmi/chains";
import {
  STUDENT_TOKEN_REGISTRY_ADDRESS,
  PAIR_LAUNCHER_ADDRESS,
  WETH_ADDRESS,
  studentTokenRegistryAbi,
  pairLauncherAbi,
} from "../../lib/contracts";

const UNISWAP_V2_ROUTER = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3" as const;

const routerAbi = [
  {
    type: "function",
    name: "addLiquidity",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "amountADesired", type: "uint256" },
      { name: "amountBDesired", type: "uint256" },
      { name: "amountAMin", type: "uint256" },
      { name: "amountBMin", type: "uint256" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [
      { name: "amountA", type: "uint256" },
      { name: "amountB", type: "uint256" },
      { name: "liquidity", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "addLiquidityETH",
    stateMutability: "payable",
    inputs: [
      { name: "token", type: "address" },
      { name: "amountTokenDesired", type: "uint256" },
      { name: "amountTokenMin", type: "uint256" },
      { name: "amountETHMin", type: "uint256" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [
      { name: "amountToken", type: "uint256" },
      { name: "amountETH", type: "uint256" },
      { name: "liquidity", type: "uint256" },
    ],
  },
] as const;

const erc20Abi = [
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

type TokenRecord = {
  token: string;
  title: string;
  symbol: string;
  exists: boolean;
};

type Step = "approve_a" | "approve_b" | "add_liquidity" | "done";

export default function AddLiquidityPage() {
  const { address, isConnected } = useAccount();
  const [studentToken, setStudentToken] = useState("");
  const [baseToken, setBaseToken] = useState("");
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [step, setStep] = useState<Step>("approve_a");

  const { data: allTokens } = useReadContract({
    address: STUDENT_TOKEN_REGISTRY_ADDRESS,
    abi: studentTokenRegistryAbi,
    functionName: "getAllTokens",
  });

  const tokens = (allTokens as unknown as TokenRecord[] | undefined)?.filter((t) => t.exists) ?? [];

  const { data: pairAddress } = useReadContract({
    address: PAIR_LAUNCHER_ADDRESS,
    abi: pairLauncherAbi,
    functionName: "getExistingPair",
    args: studentToken && baseToken
      ? [studentToken as `0x${string}`, baseToken as `0x${string}`]
      : undefined,
    query: { enabled: (!!studentToken && !!baseToken) },
  });

  const { data: allowanceA } = useReadContract({
    address: studentToken as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, UNISWAP_V2_ROUTER] : undefined,
    query: { enabled: (!!studentToken && !!address) },
  });

  const { data: allowanceB } = useReadContract({
    address: baseToken as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, UNISWAP_V2_ROUTER] : undefined,
    query: { enabled: (!!baseToken && !!address && baseToken !== WETH_ADDRESS) },
  });

  const { data: balanceA } = useReadContract({
    address: studentToken as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: (!!studentToken && !!address) },
  });

  const { data: balanceB } = useReadContract({
    address: baseToken as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: (!!baseToken && !!address && baseToken !== WETH_ADDRESS) },
  });

  const { writeContract, data: txHash, isPending, error: writeError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });


  const { data: decimalsA } = useReadContract({
    address: studentToken as `0x${string}`,
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled: !!studentToken },
  });
  const { data: decimalsB } = useReadContract({
    address: baseToken as `0x${string}`,
    abi: erc20Abi,
    functionName: "decimals",
    query: { enabled: (!!baseToken && baseToken !== WETH_ADDRESS) },
  });
  const tokenDecimalsA = (decimalsA as number | undefined) ?? 18;
  const tokenDecimalsB = (decimalsB as number | undefined) ?? 18;

  const amountAWei = amountA && parseFloat(amountA) > 0 ? parseUnits(amountA, tokenDecimalsA) : BigInt(0);
  const amountBWei = amountB && parseFloat(amountB) > 0 ? parseUnits(amountB, tokenDecimalsB) : BigInt(0);
  const needsApproveA = !allowanceA || (allowanceA as bigint) < amountAWei;
  const needsApproveB = baseToken !== WETH_ADDRESS && (!allowanceB || (allowanceB as bigint) < amountBWei);

  function handleApproveA() {
    if (!studentToken || !amountA) return;
    writeContract({
      address: studentToken as `0x${string}`,
      abi: erc20Abi,
      functionName: "approve",
      args: [UNISWAP_V2_ROUTER, amountAWei],
      chain: sepolia,
      account: address,
    });
    setStep("approve_b");
  }

  function handleApproveB() {
    if (!baseToken || !amountB) return;
    writeContract({
      address: baseToken as `0x${string}`,
      abi: erc20Abi,
      functionName: "approve",
      args: [UNISWAP_V2_ROUTER, amountBWei],
      chain: sepolia,
      account: address,
    });
    setStep("add_liquidity");
  }

  function handleAddLiquidity() {
    if (!studentToken || !baseToken || !address || !amountA || !amountB) return;
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
    const slippage = BigInt(95);
    if (baseToken === WETH_ADDRESS) {
      writeContract({
        address: UNISWAP_V2_ROUTER,
        abi: routerAbi,
        functionName: "addLiquidityETH",
        args: [
          studentToken as `0x${string}`,
          amountAWei,
          (amountAWei * slippage) / BigInt(100),
          (amountBWei * slippage) / BigInt(100),
          address,
          deadline,
        ],
        value: amountBWei,
        gas: BigInt(3000000),
        chain: sepolia,
        account: address,
      });
    } else {
      writeContract({
        address: UNISWAP_V2_ROUTER,
        abi: routerAbi,
        functionName: "addLiquidity",
        args: [
          studentToken as `0x${string}`,
          baseToken as `0x${string}`,
          amountAWei,
          amountBWei,
          (amountAWei * slippage) / BigInt(100),
          (amountBWei * slippage) / BigInt(100),
          address,
          deadline,
        ],
        gas: BigInt(3000000),
        chain: sepolia,
        account: address,
      });
    }
  }

  const selectedToken = tokens.find((t) => t.token === studentToken);
  const baseTokenLabel = baseToken === WETH_ADDRESS ? "SepoliaETH" : tokens.find((t) => t.token === baseToken)?.symbol ?? baseToken;
  const pairExists = pairAddress && pairAddress !== "0x0000000000000000000000000000000000000000";

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-800">Add Liquidity</h1>
        <p className="text-slate-500 max-w-2xl">
          Add liquidity to an existing Uniswap V2 pool. Both tokens must be approved before adding.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <section className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-semibold text-slate-700">Liquidity amounts</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Student token</label>
            <select
              value={studentToken}
              onChange={(e) => { setStudentToken(e.target.value); setStep("approve_a"); }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
            >
              <option value="">Select student token</option>
              {tokens.map((t) => (
                <option key={t.token} value={t.token}>{t.title} ({t.symbol})</option>
              ))}
            </select>
            {balanceA !== undefined && (
              <p className="text-xs text-slate-400">Balance: {formatUnits(balanceA as bigint, tokenDecimalsA)}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Amount of student token</label>
            <input
              type="number"
              value={amountA}
              onChange={(e) => setAmountA(e.target.value)}
              placeholder="0.0"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Base token</label>
            <select
              value={baseToken}
              onChange={(e) => { setBaseToken(e.target.value); setStep("approve_a"); }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
            >
              <option value="">Select base token</option>
              <option value={WETH_ADDRESS}>SepoliaETH</option>
              {tokens.filter((t) => t.token !== studentToken).map((t) => (
                <option key={t.token} value={t.token}>{t.title} ({t.symbol})</option>
              ))}
            </select>
            {balanceB !== undefined && (
              <p className="text-xs text-slate-400">Balance: {formatUnits(balanceB as bigint, tokenDecimalsB)}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Amount of base token</label>
            <input
              type="number"
              value={amountB}
              onChange={(e) => setAmountB(e.target.value)}
              placeholder="0.0"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
            />
          </div>

          {!pairExists && studentToken && baseToken && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              No pool found for this pair. Create a pool first.
            </div>
          )}

          {isSuccess && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              Transaction successful!{" "}
              {txHash && (
                <a href={"https://sepolia.etherscan.io/tx/" + txHash} target="_blank" rel="noopener noreferrer" className="underline">
                  View on Etherscan
                </a>
              )}
            </div>
          )}

          {writeError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {writeError.message.slice(0, 200)}
            </div>
          )}

          {!isConnected && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              Connect wallet to add liquidity.
            </div>
          )}

          <div className="space-y-3 pt-2">
            {needsApproveA && (
              <button
                onClick={handleApproveA}
                disabled={!studentToken || !amountA || isPending || isConfirming}
                className="w-full rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white disabled:opacity-40 hover:bg-blue-400"
              >
                {isPending && step === "approve_a" ? "Approving..." : "1. Approve " + (selectedToken?.symbol ?? "Token A")}
              </button>
            )}

            {!needsApproveA && needsApproveB && (
              <button
                onClick={handleApproveB}
                disabled={!baseToken || !amountB || isPending || isConfirming}
                className="w-full rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white disabled:opacity-40 hover:bg-blue-400"
              >
                {isPending && step === "approve_b" ? "Approving..." : "2. Approve " + baseTokenLabel}
              </button>
            )}

            {!needsApproveA && !needsApproveB && (
              <button
                onClick={handleAddLiquidity}
                disabled={!pairExists || !amountA || !amountB || isPending || isConfirming}
                className="w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white disabled:opacity-40 hover:bg-green-500"
              >
                {isPending ? "Confirm in wallet..." : isConfirming ? "Confirming..." : "Add Liquidity"}
              </button>
            )}

            <Link href="/create-pool" className="block text-center rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-50">
              Back to Create Pool
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-700">Preview</h2>

          <div className="rounded-xl bg-slate-50 p-4 text-sm space-y-2">
            <p className="text-slate-400">Token A</p>
            <p className="font-medium text-slate-800">{selectedToken ? selectedToken.title + " (" + selectedToken.symbol + ")" : "—"}</p>
            <p className="text-slate-400 mt-2">Amount</p>
            <p className="font-medium text-slate-800">{amountA || "—"}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm space-y-2">
            <p className="text-slate-400">Token B</p>
            <p className="font-medium text-slate-800">{baseToken ? baseTokenLabel : "—"}</p>
            <p className="text-slate-400 mt-2">Amount</p>
            <p className="font-medium text-slate-800">{amountB || "—"}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm space-y-2">
            <p className="text-slate-400">Pool</p>
            <p className="font-medium text-slate-800 break-all text-xs">{pairExists ? String(pairAddress).slice(0, 20) + "..." : "—"}</p>
            <p className="text-slate-400 mt-2">Slippage tolerance</p>
            <p className="font-medium text-slate-800">5%</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm space-y-2">
            <p className="text-slate-400">Steps</p>
            <p className={needsApproveA ? "text-amber-600" : "text-green-600"}>
              {needsApproveA ? "⏳ Approve Token A" : "✓ Token A approved"}
            </p>
            {baseToken !== WETH_ADDRESS && (
              <p className={needsApproveB ? "text-amber-600" : "text-green-600"}>
                {needsApproveB ? "⏳ Approve Token B" : "✓ Token B approved"}
              </p>
            )}
            <p className="text-slate-400">Add Liquidity</p>
          </div>
        </section>
      </div>
    </div>
  );
}
