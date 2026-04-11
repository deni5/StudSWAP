"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { sepolia } from "wagmi/chains";
import {
  STUDENT_TOKEN_REGISTRY_ADDRESS,
  WETH_ADDRESS,
  studentTokenRegistryAbi,
} from "../../lib/contracts";

const UNISWAP_V2_ROUTER = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3" as const;

const routerAbi = [
  {
    type: "function",
    name: "swapExactTokensForTokens",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "getAmountsOut",
    stateMutability: "view",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "path", type: "address[]" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
] as const;

const erc20Abi = [
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
  {
    type: "function",
    name: "swapExactETHForTokens",
    stateMutability: "payable",
    inputs: [
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "swapExactTokensForETH",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
] as const;

type TokenRecord = {
  token: string;
  title: string;
  symbol: string;
  exists: boolean;
};

export default function SwapPage() {
  const { address, isConnected } = useAccount();
  const [tokenIn, setTokenIn] = useState("");
  const [tokenOut, setTokenOut] = useState("");
  const [amountIn, setAmountIn] = useState("");
  const [slippage, setSlippage] = useState("0.5");

  const { data: allTokens } = useReadContract({
    address: STUDENT_TOKEN_REGISTRY_ADDRESS,
    abi: studentTokenRegistryAbi,
    functionName: "getAllTokens",
  });

  const tokens = (allTokens as unknown as TokenRecord[] | undefined)?.filter((t) => t.exists) ?? [];

  const allOptions = [
    { token: WETH_ADDRESS, symbol: "WETH", title: "Sepolia WETH" },
    ...tokens.map((t) => ({ token: t.token, symbol: t.symbol, title: t.title })),
  ];

  const amountInWei = amountIn && tokenIn && parseFloat(amountIn) > 0 ? parseUnits(amountIn, 18) : BigInt(0);

  const { data: amountsOut } = useReadContract({
    address: UNISWAP_V2_ROUTER,
    abi: routerAbi,
    functionName: "getAmountsOut",
    args: amountInWei > BigInt(0) && tokenIn && tokenOut
      ? [amountInWei, [tokenIn as `0x${string}`, tokenOut as `0x${string}`]]
      : undefined,
    query: { enabled: (amountInWei > BigInt(0) && !!tokenIn && !!tokenOut && tokenIn !== tokenOut) },
  });

  const { data: allowance } = useReadContract({
    address: tokenIn as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, UNISWAP_V2_ROUTER] : undefined,
    query: { enabled: (!!tokenIn && !!address) },
  });

  const { data: nativeBalance } = useBalance({ address: address, query: { enabled: !!address } });

  const { data: balanceIn } = useReadContract({
    address: tokenIn as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: (!!tokenIn && !!address) },
  });

  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const estimatedOut = amountsOut ? (amountsOut as bigint[])[1] : undefined;
  const needsApprove = tokenIn !== WETH_ADDRESS && (!allowance || (allowance as bigint) < amountInWei);

  const slippageBps = Math.floor(parseFloat(slippage) * 100);
  const amountOutMin = estimatedOut
    ? (estimatedOut * BigInt(10000 - slippageBps)) / BigInt(10000)
    : BigInt(0);

  function handleApprove() {
    if (!tokenIn || !amountIn) return;
    writeContract({
      address: tokenIn as `0x${string}`,
      abi: erc20Abi,
      functionName: "approve",
      args: [UNISWAP_V2_ROUTER, amountInWei],
      chain: sepolia,
      account: address,
    });
  }

  function handleSwap() {
    if (!tokenIn || !tokenOut || !amountIn || !address) return;
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
    if (tokenIn === WETH_ADDRESS) {
      writeContract({
        address: UNISWAP_V2_ROUTER,
        abi: routerAbi,
        functionName: "swapExactETHForTokens",
        args: [
          amountOutMin,
          [tokenIn as `0x${string}`, tokenOut as `0x${string}`],
          address,
          deadline,
        ],
        value: amountInWei,
        chain: sepolia,
        account: address,
      });
    } else if (tokenOut === WETH_ADDRESS) {
      writeContract({
        address: UNISWAP_V2_ROUTER,
        abi: routerAbi,
        functionName: "swapExactTokensForETH",
        args: [
          amountInWei,
          amountOutMin,
          [tokenIn as `0x${string}`, tokenOut as `0x${string}`],
          address,
          deadline,
        ],
        chain: sepolia,
        account: address,
      });
    } else {
      writeContract({
        address: UNISWAP_V2_ROUTER,
        abi: routerAbi,
        functionName: "swapExactTokensForTokens",
        args: [
          amountInWei,
          amountOutMin,
          [tokenIn as `0x${string}`, tokenOut as `0x${string}`],
          address,
          deadline,
        ],
        chain: sepolia,
        account: address,
      });
    }
  }

  function handleSwitch() {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn("");
  }

  const tokenInLabel = allOptions.find((t) => t.token === tokenIn)?.symbol ?? "—";
  const tokenOutLabel = allOptions.find((t) => t.token === tokenOut)?.symbol ?? "—";

  return (
    <div className="mx-auto max-w-xl space-y-6 px-6 py-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-800">Swap</h1>
        <p className="text-slate-500">Exchange student tokens via Uniswap V2 pools on Sepolia.</p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">From</label>
          <select
            value={tokenIn}
            onChange={(e) => setTokenIn(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
          >
            <option value="">Select token</option>
            {allOptions.filter((t) => t.token !== tokenOut).map((t) => (
              <option key={t.token} value={t.token}>{t.title} ({t.symbol})</option>
            ))}
          </select>
          <input
            type="number"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            placeholder="0.0"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
          />
          {tokenIn === WETH_ADDRESS
            ? nativeBalance && <p className="text-xs text-slate-400">Balance: {parseFloat(nativeBalance.formatted).toFixed(4)} ETH</p>
            : balanceIn !== undefined && <p className="text-xs text-slate-400">Balance: {formatUnits(balanceIn as bigint, 18)} {tokenInLabel}</p>
          }
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSwitch}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-500 hover:bg-slate-50"
          >
            ↕
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">To</label>
          <select
            value={tokenOut}
            onChange={(e) => setTokenOut(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
          >
            <option value="">Select token</option>
            {allOptions.filter((t) => t.token !== tokenIn).map((t) => (
              <option key={t.token} value={t.token}>{t.title} ({t.symbol})</option>
            ))}
          </select>
          <div className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600">
            {estimatedOut ? formatUnits(estimatedOut, 18) : "0.0"}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="text-slate-400">Rate</p>
            <p className="font-medium text-slate-800 mt-1">
              {estimatedOut && amountIn
                ? (parseFloat(formatUnits(estimatedOut, 18)) / parseFloat(amountIn)).toFixed(6) + " " + tokenOutLabel + "/" + tokenInLabel
                : "—"}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="text-slate-400">Slippage %</p>
            <input
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-800 text-sm"
            />
          </div>
        </div>

        {estimatedOut && amountOutMin > BigInt(0) && (
          <div className="rounded-xl bg-slate-50 p-3 text-sm space-y-1">
            <p className="text-slate-400">Minimum received</p>
            <p className="font-medium text-slate-800">{formatUnits(amountOutMin, 18)} {tokenOutLabel}</p>
          </div>
        )}

        {isSuccess && txHash && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            Swap successful!{" "}
            <a href={"https://sepolia.etherscan.io/tx/" + txHash} target="_blank" rel="noopener noreferrer" className="underline">
              View on Etherscan
            </a>
          </div>
        )}

        {writeError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {writeError.message.slice(0, 200)}
          </div>
        )}

        {!isConnected && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            Connect wallet to swap.
          </div>
        )}

        <div className="space-y-2 pt-1">
          {needsApprove && tokenIn && amountIn && (
            <button
              onClick={handleApprove}
              disabled={isPending || isConfirming}
              className="w-full rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white disabled:opacity-40 hover:bg-blue-400"
            >
              {isPending ? "Approving..." : "Approve " + tokenInLabel}
            </button>
          )}

          {!needsApprove && (
            <button
              onClick={handleSwap}
              disabled={!tokenIn || !tokenOut || !amountIn || !estimatedOut || isPending || isConfirming}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-40 hover:bg-blue-500"
            >
              {isPending ? "Confirm in wallet..." : isConfirming ? "Confirming..." : "Swap"}
            </button>
          )}

          <Link href="/add-liquidity" className="block text-center rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-50">
            Back to Add Liquidity
          </Link>
        </div>
      </div>
    </div>
  );
}
