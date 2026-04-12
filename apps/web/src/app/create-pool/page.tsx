"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { sepolia } from "wagmi/chains";
import {
  STUDENT_TOKEN_REGISTRY_ADDRESS,
  PAIR_LAUNCHER_ADDRESS,
  WETH_ADDRESS,
  studentTokenRegistryAbi,
  pairLauncherAbi,
} from "../../lib/contracts";

type TokenRecord = {
  token: string;
  title: string;
  symbol: string;
  exists: boolean;
};

export default function CreatePoolPage() {
  const { address, isConnected } = useAccount();
  const [studentToken, setStudentToken] = useState("");
  const [baseToken, setBaseToken] = useState("");

  const { data: allTokens } = useReadContract({
    address: STUDENT_TOKEN_REGISTRY_ADDRESS,
    abi: studentTokenRegistryAbi,
    functionName: "getAllTokens",
  });

  const tokens = (allTokens as unknown as TokenRecord[] | undefined)?.filter((t) => t.exists) ?? [];

  const { data: pairExists } = useReadContract({
    address: PAIR_LAUNCHER_ADDRESS,
    abi: pairLauncherAbi,
    functionName: "pairExists",
    args: (studentToken && baseToken) ? [studentToken as `0x${string}`, baseToken as `0x${string}`] : undefined,
    query: { enabled: (!!studentToken && !!baseToken) },
  });

  const { data: existingPairAddress } = useReadContract({
    address: PAIR_LAUNCHER_ADDRESS,
    abi: pairLauncherAbi,
    functionName: "getExistingPair",
    args: (studentToken && baseToken) ? [studentToken as `0x${string}`, baseToken as `0x${string}`] : undefined,
    query: { enabled: (!!pairExists) },
  });

  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  function handleCreatePair() {
    if (!studentToken || !baseToken || !address) return;
    writeContract({
      address: PAIR_LAUNCHER_ADDRESS,
      abi: pairLauncherAbi,
      functionName: "launchPair",
      args: [studentToken as `0x${string}`, baseToken as `0x${string}`],
      chain: sepolia,
      account: address,
    });
  }

  const selectedToken = tokens.find((t) => t.token === studentToken);
  const baseTokenLabel = baseToken === WETH_ADDRESS
    ? "SepoliaETH"
    : tokens.find((t) => t.token === baseToken)?.symbol ?? baseToken;
  const canCreate = isConnected && !!studentToken && !!baseToken && !pairExists && !isPending && !isConfirming;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold text-slate-800">Create Pool</h1>
        <p className="text-slate-500 max-w-2xl">
          Create a Uniswap V2 liquidity pool between a registered student token and an allowed base token.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <section className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-semibold text-slate-700">Pair configuration</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Student token</label>
            <select
              value={studentToken}
              onChange={(e) => setStudentToken(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
            >
              <option value="">Select registered token</option>
              {tokens.map((t) => (
                <option key={t.token} value={t.token}>
                  {t.title} ({t.symbol})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Base token</label>
            <select
              value={baseToken}
              onChange={(e) => setBaseToken(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
            >
              <option value="">Select base token</option>
              <option value={WETH_ADDRESS}>SepoliaETH</option>
              {tokens.filter((t) => t.token !== studentToken).map((t) => (
                <option key={t.token} value={t.token}>{t.title} ({t.symbol})</option>
              ))}
            </select>
            <p className="text-xs text-slate-400">Base token must be WETH or a registered student token.</p>
          </div>

          {(pairExists && existingPairAddress) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              Pair already exists at {String(existingPairAddress).slice(0, 10)}...
            </div>
          )}

          {(isSuccess && txHash) && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              Pool created successfully.
            </div>
          )}

          {writeError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {writeError.message.slice(0, 200)}
            </div>
          )}

          {!isConnected && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              Connect wallet to create a pool.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCreatePair}
              disabled={!canCreate}
              className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-blue-500"
            >
              {isPending ? "Confirm in wallet..." : isConfirming ? "Confirming..." : "Create Pair"}
            </button>
            <Link href="/tokens" className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-50">
              Back
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-700">Pair preview</h2>
          <div className="rounded-xl bg-slate-50 p-4 text-sm space-y-2">
            <p className="text-slate-400">Token A</p>
            <p className="font-medium text-slate-800">{selectedToken ? selectedToken.title + " (" + selectedToken.symbol + ")" : "—"}</p>
            <p className="text-slate-400 mt-3">Token B</p>
            <p className="font-medium text-slate-800">{baseToken ? baseTokenLabel : "—"}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 text-sm space-y-2">
            <p className="text-slate-400">Pair status</p>
            <p className={pairExists ? "text-amber-600" : (!studentToken || !baseToken) ? "text-slate-400" : "text-green-600"}>
              {pairExists ? "Already exists" : (!studentToken || !baseToken) ? "Select both tokens" : "Ready to create"}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 text-sm">
            <p className="text-slate-400">PairLauncher</p>
            <p className="mt-1 break-all text-xs text-slate-400">{PAIR_LAUNCHER_ADDRESS}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
