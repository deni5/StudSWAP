export const STUDENT_TOKEN_REGISTRY_ADDRESS =
  process.env.NEXT_PUBLIC_STUDENT_TOKEN_REGISTRY_ADDRESS as `0x${string}`;

export const studentTokenRegistryAbi = [
  {
    type: "function",
    name: "registerToken",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "title", type: "string" },
      { name: "symbol", type: "string" },
      { name: "description", type: "string" },
      { name: "category", type: "string" },
      { name: "logoUrl", type: "string" },
      { name: "baseToken", type: "address" },
      { name: "bonusEnabled", type: "bool" },
      { name: "rewardAsset", type: "address" },
      { name: "bonusReserve", type: "uint256" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "getAllTokens",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        components: [
          { name: "token", type: "address" },
          { name: "creator", type: "address" },
          { name: "title", type: "string" },
          { name: "symbol", type: "string" },
          { name: "description", type: "string" },
          { name: "category", type: "string" },
          { name: "logoUrl", type: "string" },
          { name: "baseToken", type: "address" },
          { name: "bonusEnabled", type: "bool" },
          { name: "rewardAsset", type: "address" },
          { name: "bonusReserve", type: "uint256" },
          { name: "createdAt", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "exists", type: "bool" }
        ],
        name: "",
        type: "tuple[]"
      }
    ]
  },
  {
    type: "function",
    name: "getToken",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [
      {
        components: [
          { name: "token", type: "address" },
          { name: "creator", type: "address" },
          { name: "title", type: "string" },
          { name: "symbol", type: "string" },
          { name: "description", type: "string" },
          { name: "category", type: "string" },
          { name: "logoUrl", type: "string" },
          { name: "baseToken", type: "address" },
          { name: "bonusEnabled", type: "bool" },
          { name: "rewardAsset", type: "address" },
          { name: "bonusReserve", type: "uint256" },
          { name: "createdAt", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "exists", type: "bool" }
        ],
        name: "",
        type: "tuple"
      }
    ]
  }
] as const;
