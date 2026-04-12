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
import { PAIR_LAUNCHER_ADDRESS, pairLauncherAbi } from "../../lib/contracts";

const RECEIPT_VAULT = "0xf73E71b16494F88E56C6176fc7968033Af0bbC96" as const;
const RECEIPT_TOKEN = "0xA7dbAa46BDF0a591398215ef050A0EEF9ad1aC1A" as const;

const vaultAbi = [
  {
    type: "function",
    name: "depositLP",
    stateMutability: "nonpayable",
    inputs: [
      { name: "lpToken", type: "address" },
      { name: "lpAmount", type: "uint256" },
      { name: "receiptAmount", type: "uint256" },
    ],
    outputs: [],
  },
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
  {
    type: "function",
    name: "getUserPositionIds",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "isRedeemable",
    stateMutability: "view",
    inputs: [{ name: "positionId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "redeemPosition",
    stateMutability: "nonpayable",
    inputs: [{ name: "positionId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "LOCK_PERIOD",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
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
] as const;

type Position = {
  owner: string;
  lpToken: string;
  lpAmount: bigint;
  receiptAmount: bigint;
  depositedAt: bigint;
  unlockAt: bigint;
  redeemed: boolean;
};

export default function VaultPage() {
  const { address, isConnected } = useAccount();
  const [lpTokenAddress, setLpTokenAddress] = useState("");
  const [useCustomAddress, setUseCustomAddress] = useState(false);

  const { data: allPairs } = useReadContract({
    address: PAIR_LAUNCHER_ADDRESS,
    abi: pairLauncherAbi,
    functionName: "getAllPairRecords",
  });

  const pairs = (allPairs as unknown as any[] | undefined)?.filter((p) => p.exists) ?? [];
  const [lpAmount, setLpAmount] = useState("");
  const [receiptAmount, setReceiptAmount] = useState("");

  const { data: positions, refetch: refetchPositions } = useReadContract({
    address: RECEIPT_VAULT,
    abi: vaultAbi,
    functionName: "getUserPositions",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: positionIds } = useReadContract({
    address: RECEIPT_VAULT,
    abi: vaultAbi,
    functionName: "getUserPositionIds",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: lpBalance } = useReadContract({
    address: lpTokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: (!!lpTokenAddress && !!address) },
  });

  const { data: lpAllowance } = useReadContract({
    address: lpTokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, RECEIPT_VAULT] : undefined,
    query: { enabled: (!!lpTokenAddress && !!address) },
  });

  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const lpAmountWei = lpAmount ? parseUnits(lpAmount, 18) : BigInt(0);
  const receiptAmountWei = receiptAmount ? parseUnits(receiptAmount, 18) : BigInt(0);
  const needsApprove = !lpAllowance || (lpAllowance as bigint) < lpAmountWei;

  function handleApprove() {
    if (!lpTokenAddress || !lpAmount) return;
    writeContract({
      address: lpTokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "approve",
      args: [RECEIPT_VAULT, lpAmountWei],
      chain: sepolia,
      account: address,
    });
  }

  function handleDeposit() {
    if (!lpTokenAddress || !lpAmount || !receiptAmount) return;
    writeContract({
      address: RECEIPT_VAULT,
      abi: vaultAbi,
      functionName: "depositLP",
      args: [lpTokenAddress as `0x${string}`, lpAmountWei, receiptAmountWei],
      chain: sepolia,
      account: address,
    });
  }

  function handleRedeem(positionId: bigint) {
    writeContract({
      address: RECEIPT_VAULT,
      abi: vaultAbi,
      functionName: "redeemPosition",
      args: [positionId],
      chain: sepolia,
      account: address,
    });
  }

  const positionList = (positions as unknown as Position[] | undefined) ?? [];
  const idList = (positionIds as unknown as bigint[] | undefined) ?? [];
  const activePositions = positionList.filter((p) => !p.redeemed);
  const totalLocked = activePositions.reduce((acc, p) => acc + p.lpAmount, BigInt(0));

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-800">Vault</h1>
        <p className="text-slate-500 max-w-2xl">
          Lock LP tokens into the vault, receive receipt tokens, and redeem after the 30-day lock period.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-400">Total Locked LP</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">{formatUnits(totalLocked, 18)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-400">Active Positions</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">{activePositions.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-400">Lock Period</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">30 days</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="text-lg font-semibold text-slate-700">Lock LP Position</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">LP Token (pool)</label>
          {pairs.length > 0 && !useCustomAddress ? (
            <select
              value={lpTokenAddress}
              onChange={(e) => setLpTokenAddress(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
            >
              <option value="">Select pool</option>
              {pairs.map((p: any) => (
                <option key={p.pair} value={p.pair}>
                  {p.pair.slice(0, 10)}... ({p.token.slice(0, 6)}.../{p.baseToken.slice(0, 6)}...)
                </option>
              ))}
            </select>
          ) : (
            <input
              value={lpTokenAddress}
              onChange={(e) => setLpTokenAddress(e.target.value)}
              placeholder="0x... (Uniswap V2 pair address)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
            />
          )}
          <button
            onClick={() => { setUseCustomAddress(!useCustomAddress); setLpTokenAddress(""); }}
            className="text-xs text-blue-600 hover:underline"
          >
            {useCustomAddress ? "← Select from list" : "Enter address manually"}
          </button>
          {lpBalance !== undefined && lpTokenAddress && (
            <p className="text-xs text-slate-400">Balance: {formatUnits(lpBalance as bigint, 18)} LP</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">LP amount to lock</label>
            <input
              type="number"
              value={lpAmount}
              onChange={(e) => setLpAmount(e.target.value)}
              placeholder="0.0"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Receipt tokens to mint</label>
            <input
              type="number"
              value={receiptAmount}
              onChange={(e) => setReceiptAmount(e.target.value)}
              placeholder="0.0"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
            />
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 space-y-1">
          <p>Receipt token: <span className="font-mono text-xs">{RECEIPT_TOKEN}</span></p>
          <p>Lock period: 30 days</p>
          <p>After lock — redeem LP back + optional bonus</p>
        </div>

        {isSuccess && txHash && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            Transaction successful!{" "}
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
            Connect wallet to use vault.
          </div>
        )}

        <div className="flex gap-3">
          {needsApprove ? (
            <button
              onClick={handleApprove}
              disabled={!lpTokenAddress || !lpAmount || isPending || isConfirming}
              className="flex-1 rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white disabled:opacity-40 hover:bg-blue-400"
            >
              {isPending ? "Approving..." : "Approve LP Token"}
            </button>
          ) : (
            <button
              onClick={handleDeposit}
              disabled={!lpTokenAddress || !lpAmount || !receiptAmount || isPending || isConfirming}
              className="flex-1 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white disabled:opacity-40 hover:bg-green-500"
            >
              {isPending ? "Confirm in wallet..." : isConfirming ? "Confirming..." : "Lock LP"}
            </button>
          )}
          <Link href="/add-liquidity" className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-50">
            Add Liquidity
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-700">My Positions</h2>
        </div>
        {positionList.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400">
            {isConnected ? "No vault positions yet." : "Connect wallet to view positions."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">LP Token</th>
                  <th className="px-4 py-3 text-left">LP Locked</th>
                  <th className="px-4 py-3 text-left">Receipt</th>
                  <th className="px-4 py-3 text-left">Unlock Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {positionList.map((pos, i) => {
                  const posId = idList[i] ?? BigInt(i);
                  const unlockDate = new Date(Number(pos.unlockAt) * 1000).toLocaleDateString();
                  const now = Math.floor(Date.now() / 1000);
                  const redeemable = !pos.redeemed && Number(pos.unlockAt) <= now;
                  return (
                    <tr key={i} className="border-t border-slate-100 text-slate-700">
                      <td className="px-4 py-4 font-mono text-xs">{posId.toString()}</td>
                      <td className="px-4 py-4 font-mono text-xs">{pos.lpToken.slice(0, 10)}...</td>
                      <td className="px-4 py-4">{formatUnits(pos.lpAmount, 18)}</td>
                      <td className="px-4 py-4">{formatUnits(pos.receiptAmount, 18)}</td>
                      <td className="px-4 py-4">{unlockDate}</td>
                      <td className="px-4 py-4">
                        <span className={"rounded-full px-3 py-1 text-xs font-medium " + (pos.redeemed ? "bg-slate-100 text-slate-400" : redeemable ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                          {pos.redeemed ? "Redeemed" : redeemable ? "Redeemable" : "Locked"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleRedeem(posId)}
                          disabled={!redeemable || isPending || isConfirming}
                          className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-40 hover:bg-green-500"
                        >
                          Redeem
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
