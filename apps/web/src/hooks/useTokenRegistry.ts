"use client";

import { useReadContract, useWriteContract } from "wagmi";
import {
  STUDENT_TOKEN_REGISTRY_ADDRESS,
  studentTokenRegistryAbi,
} from "../lib/contracts";

export function useTokenRegistry() {
  const allTokensQuery = useReadContract({
    address: STUDENT_TOKEN_REGISTRY_ADDRESS,
    abi: studentTokenRegistryAbi,
    functionName: "getAllTokens",
    query: {
      enabled:
        !!STUDENT_TOKEN_REGISTRY_ADDRESS &&
        STUDENT_TOKEN_REGISTRY_ADDRESS !==
          "0x0000000000000000000000000000000000000000",
    },
  });

  const { writeContractAsync, isPending } = useWriteContract();

  return {
    allTokensQuery,
    registerToken: writeContractAsync,
    isRegisterPending: isPending,
  };
}

