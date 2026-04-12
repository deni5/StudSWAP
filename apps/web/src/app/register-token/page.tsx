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
  WETH_ADDRESS,
  studentTokenRegistryAbi,
} from "../../lib/contracts";

type TxState = "idle" | "pending" | "success" | "failed";

export default function RegisterTokenPage() {
  const { address, isConnected } = useAccount();
  const { isWrongNetwork } = useSepoliaGuard();
  const { registerToken, isRegisterPending } = useTokenRegistry();

  const [tokenAddress, setTokenAddress] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function uploadToPinata(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("pinataMetadata", JSON.stringify({ name: file.name }));
    formData.append("pinataOptions", JSON.stringify({ cidVersion: 0 }));

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
        pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET!,
      },
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return "https://gateway.pinata.cloud/ipfs/" + data.IpfsHash;
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadToPinata(file);
      setLogoUrl(url);
    } catch {
      setUploadError("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }
  const [title, setTitle] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [baseToken, setBaseToken] = useState(WETH_ADDRESS ?? "");
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
    if (!isConnected) result.wallet = "Connect wallet to continue";
    if (isWrongNetwork) result.network = "Switch to Sepolia to continue";
    if (!STUDENT_TOKEN_REGISTRY_ADDRESS || STUDENT_TOKEN_REGISTRY_ADDRESS === "0x0000000000000000000000000000000000000000") {
      result.registry = "Registry contract address is not configured";
    }
    return result;
  }, [tokenAddress, title, symbol, description, category, baseToken, bonusEnabled, rewardAsset, bonusReserve, isConnected, isWrongNetwork]);

  const isValid = Object.keys(errors).length === 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || !address) return;
    try {
      setTxState("pending");
      setTxMessage("Submitting token registration...");
      const reserveValue = bonusEnabled && bonusReserve ? parseUnits(bonusReserve, 18) : BigInt(0);
      await registerToken({
        address: STUDENT_TOKEN_REGISTRY_ADDRESS,
        abi: studentTokenRegistryAbi,
        functionName: "registerToken",
        account: address as `0x${string}`,
        chain: sepolia,
        args: [
          tokenAddress as `0x${string}`,
          title, symbol, description, category, logoUrl,
          baseToken as `0x${string}`,
          bonusEnabled,
          bonusEnabled ? (rewardAsset as `0x${string}`) : ("0x0000000000000000000000000000000000000000" as `0x${string}`),
          reserveValue,
        ],
      });
      setTxState("success");
      setTxMessage("Token registered successfully.");
    } catch (error) {
      setTxState("failed");
      setTxMessage(
        error instanceof Error && error.message.includes("already registered")
          ? "This token is already registered in the registry."
          : "Token registration failed. Please review the inputs and try again."
      );
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">Register Token</h1>
        <p className="text-slate-500 max-w-2xl">
          Add your student ERC-20 token to the StudSWAP registry to enable pool creation and trading.
        </p>
      </header>

      {(txState === "pending" || txState === "success" || txState === "failed") && (
        <TxStatus status={txState} message={txMessage} />
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Token address" value={tokenAddress} onChange={setTokenAddress} placeholder="0x..." error={errors.tokenAddress} />
          <Field label="Title" value={title} onChange={setTitle} placeholder="My Student Token" error={errors.title} />
          <Field label="Symbol" value={symbol} onChange={setSymbol} placeholder="MST" error={errors.symbol} />
          <Field label="Category" value={category} onChange={setCategory} placeholder="Education" error={errors.category} />
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Logo</label>
            <div className="flex gap-2 items-center">
              <label className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 hover:bg-slate-100 transition-colors">
                {uploading ? "Uploading..." : "Upload image"}
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
              </label>
              <span className="text-slate-400 text-xs">or</span>
              <input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://... or IPFS URL"
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none text-sm"
              />
            </div>
            {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
            {logoUrl && (
              <div className="flex items-center gap-3 mt-2">
                <img src={logoUrl} alt="Logo preview" className="w-12 h-12 rounded-full object-cover border border-slate-200" onError={(e) => (e.currentTarget.style.display = "none")} />
                <p className="text-xs text-slate-400 break-all">{logoUrl}</p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Base token</label>
            <select
              value={baseToken}
              onChange={(e) => setBaseToken(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
            >
              <option value={WETH_ADDRESS}>Sepolia WETH (recommended)</option>
              <option value="">Custom address...</option>
            </select>
            {baseToken !== WETH_ADDRESS && (
              <input
                value={baseToken}
                onChange={(e) => setBaseToken(e.target.value)}
                placeholder="0x..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800"
              />
            )}
            {errors.baseToken && <p className="text-sm text-red-500">{errors.baseToken}</p>}
            <p className="text-xs text-slate-400">Base token must be in AllowedBaseTokens. Use Sepolia WETH by default.</p>
          </div>
        </div>

        <Field label="Description" value={description} onChange={setDescription} placeholder="Short description of your token" error={errors.description} textarea />

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={bonusEnabled} onChange={(e) => setBonusEnabled(e.target.checked)} className="w-4 h-4" />
            <span className="font-medium text-slate-700">Enable 30-day redeem bonus</span>
          </label>
        </div>

        {bonusEnabled && (
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Reward asset" value={rewardAsset} onChange={setRewardAsset} placeholder="0x..." error={errors.rewardAsset} />
            <Field label="Bonus reserve" value={bonusReserve} onChange={setBonusReserve} placeholder="1000" error={errors.bonusReserve} />
          </div>
        )}

        {(errors.wallet || errors.network || errors.registry) && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 space-y-1">
            {errors.wallet && <p>{errors.wallet}</p>}
            {errors.network && <p>{errors.network}</p>}
            {errors.registry && <p>{errors.registry}</p>}
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={!isValid || isRegisterPending}
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-blue-500"
          >
            {isRegisterPending ? "Submitting..." : "Register Token"}
          </button>
          <a href="/tokens" className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-600 hover:bg-slate-50">
            View Tokens
          </a>
        </div>
      </form>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, error, textarea = false,
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
      <label className="text-sm font-medium text-slate-600">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none"
        />
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
