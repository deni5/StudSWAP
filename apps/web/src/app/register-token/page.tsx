"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { sepolia } from "wagmi/chains";
import { parseUnits, isAddress } from "viem";
import { useSepoliaGuard } from "../../hooks/useSepoliaGuard";
import { useTokenRegistry } from "../../hooks/useTokenRegistry";
import { TxStatus } from "../../components/tx-status";
import {
  STUDENT_TOKEN_REGISTRY_ADDRESS,
  studentTokenRegistryAbi,
} from "../../lib/contracts";

type TxState = "idle" | "pending" | "success" | "failed";

export default function RegisterTokenPage() {
  const { address, isConnected } = useAccount();
  const { isWrongNetwork } = useSepoliaGuard();
  const { registerToken, isRegisterPending } = useTokenRegistry();

  const [tokenAddress, setTokenAddress] = useState("");
  const [title, setTitle] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [baseToken, setBaseToken] = useState("");
  const [bonusEnabled, setBonusEnabled] = useState(false);
  const [rewardAsset, setRewardAsset] = useState("");
  const [bonusReserve, setBonusReserve] = useState("");

  const [txState, setTxState] = useState<TxState>("idle");
  const [txMessage, setTxMessage] = useState("");

  const errors = useMemo(() => {
    const result: Record<string, string> = {};

    if (!tokenAddress.trim()) {
      result.tokenAddress = "Token address is required";
    } else if (!isAddress(tokenAddress)) {
      result.tokenAddress = "Invalid token address";
    }

    if (!title.trim()) result.title = "Title is required";
    if (!symbol.trim()) result.symbol = "Symbol is required";
    if (!description.trim()) result.description = "Description is required";
    if (!category.trim()) result.category = "Category is required";

    if (!baseToken.trim()) {
      result.baseToken = "Base token is required";
    } else if (!isAddress(baseToken)) {
      result.baseToken = "Invalid base token address";
    }

    if (bonusEnabled) {
      if (!rewardAsset.trim()) {
        result.rewardAsset = "Reward asset is required when bonus is enabled";
      } else if (!isAddress(rewardAsset)) {
        result.rewardAsset = "Invalid reward asset address";
      }

      if (!bonusReserve.trim()) {
        result.bonusReserve = "Bonus reserve is required when bonus is enabled";
      } else {
        const num = Number(bonusReserve);
        if (Number.isNaN(num) || num < 0) {
          result.bonusReserve = "Bonus reserve must be a valid positive number";
        }
      }
    }

    if (!isConnected) {
      result.wallet = "Connect wallet to continue";
    }

    if (isWrongNetwork) {
      result.network = "Switch to Sepolia to continue";
    }

    if (
      !STUDENT_TOKEN_REGISTRY_ADDRESS ||
      STUDENT_TOKEN_REGISTRY_ADDRESS ===
        "0x0000000000000000000000000000000000000000"
    ) {
      result.registry = "Registry contract address is not configured";
    }

    return result;
  }, [
    tokenAddress,
    title,
    symbol,
    description,
    category,
    baseToken,
    bonusEnabled,
    rewardAsset,
    bonusReserve,
    isConnected,
    isWrongNetwork,
  ]);

  const isValid = Object.keys(errors).length === 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || !address) return;

    try {
      setTxState("pending");
      setTxMessage("Submitting token registration transaction...");

      const reserveValue =
        bonusEnabled && bonusReserve
          ? parseUnits(bonusReserve, 18)
          : BigInt(0);

      await registerToken({
  address: STUDENT_TOKEN_REGISTRY_ADDRESS,
  abi: studentTokenRegistryAbi,
  functionName: "registerToken",
  account: address as `0x${string}`,
  chain: sepolia,
  args: [
    tokenAddress as `0x${string}`,
    title,
    symbol,
    description,
    category,
    logoUrl,
    baseToken as `0x${string}`,
    bonusEnabled,
    bonusEnabled
      ? (rewardAsset as `0x${string}`)
      : ("0x0000000000000000000000000000000000000000" as `0x${string}`),
    reserveValue,
  ],
});

      setTxState("success");
      setTxMessage("Token registration transaction submitted successfully.");
    } catch (error) {
      console.error(error);
      setTxState("failed");
      setTxMessage("Token registration failed. Please review the inputs and try again.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-4xl font-bold">Register Token</h1>
          <p className="max-w-3xl text-slate-300">
            Register a student ERC-20 token in the StudSWAP registry and prepare
            it for future pool creation and market listing.
          </p>
        </header>

        {(txState === "pending" || txState === "success" || txState === "failed") && (
          <TxStatus status={txState === "idle" ? "pending" : txState} message={txMessage} />
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-6"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Token address" value={tokenAddress} onChange={setTokenAddress} placeholder="0x..." error={errors.tokenAddress} />
            <Field label="Title" value={title} onChange={setTitle} placeholder="Student Token" error={errors.title} />
            <Field label="Symbol" value={symbol} onChange={setSymbol} placeholder="STUD" error={errors.symbol} />
            <Field label="Category" value={category} onChange={setCategory} placeholder="Education" error={errors.category} />
            <Field label="Logo URL" value={logoUrl} onChange={setLogoUrl} placeholder="https://..." error={errors.logoUrl} />
            <Field label="Base token" value={baseToken} onChange={setBaseToken} placeholder="0x..." error={errors.baseToken} />
          </div>

          <Field
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="Short description of the token and its purpose"
            error={errors.description}
            textarea
          />

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={bonusEnabled} onChange={(e) => setBonusEnabled(e.target.checked)} />
              <span className="font-medium">Enable 30-day redeem bonus</span>
            </label>
          </div>

          {bonusEnabled && (
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Reward asset" value={rewardAsset} onChange={setRewardAsset} placeholder="0x..." error={errors.rewardAsset} />
              <Field label="Bonus reserve" value={bonusReserve} onChange={setBonusReserve} placeholder="1000" error={errors.bonusReserve} />
            </div>
          )}

          {(errors.wallet || errors.network || errors.registry) && (
            <div className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
              {errors.wallet && <p>{errors.wallet}</p>}
              {errors.network && <p>{errors.network}</p>}
              {errors.registry && <p>{errors.registry}</p>}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!isValid || isRegisterPending}
              className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRegisterPending ? "Submitting..." : "Register Token"}
            </button>

            <a
              href="/tokens"
              className="rounded-xl border border-slate-600 px-5 py-3 font-medium text-white hover:bg-slate-800"
            >
              Back to Tokens
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  textarea?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-200">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
        />
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
