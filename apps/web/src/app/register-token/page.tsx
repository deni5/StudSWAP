"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
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
    } catch
