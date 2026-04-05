export const STUDENT_TOKEN_REGISTRY_ADDRESS =
  process.env.NEXT_PUBLIC_STUDENT_TOKEN_REGISTRY_ADDRESS as `0x${string}`;

export const PAIR_LAUNCHER_ADDRESS =
  process.env.NEXT_PUBLIC_PAIR_LAUNCHER_ADDRESS as `0x${string}`;

export const ALLOWED_BASE_TOKENS_ADDRESS =
  process.env.NEXT_PUBLIC_ALLOWED_BASE_TOKENS_ADDRESS as `0x${string}`;

export const WETH_ADDRESS =
  process.env.NEXT_PUBLIC_WETH_ADDRESS as `0x${string}`;

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
  },
  {
    type: "function",
    name: "isRegistered",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ name: "", type: "bool" }]
  }
] as const;

export const pairLauncherAbi = [
  {
    type: "function",
    name: "launchPair",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "baseToken", type: "address" }
    ],
    outputs: [{ name: "pair", type: "address" }]
  },
  {
    type: "function",
    name: "pairExists",
    stateMutability: "view",
    inputs: [
      { name: "token", type: "address" },
      { name: "baseToken", type: "address" }
    ],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    type: "function",
    name: "getExistingPair",
    stateMutability: "view",
    inputs: [
      { name: "token", type: "address" },
      { name: "baseToken", type: "address" }
    ],
    outputs: [{ name: "", type: "address" }]
  },
  {
    type: "function",
    name: "getAllPairRecords",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        components: [
          { name: "token", type: "address" },
          { name: "baseToken", type: "address" },
          { name: "pair", type: "address" },
          { name: "creator", type: "address" },
          { name: "createdAt", type: "uint256" },
          { name: "exists", type: "bool" }
        ],
        name: "",
        type: "tuple[]"
      }
    ]
  },
  {
    type: "function",
    name: "getPairRecord",
    stateMutability: "view",
    inputs: [
      { name: "token", type: "address" },
      { name: "baseToken", type: "address" }
    ],
    outputs: [
      {
        components: [
          { name: "token", type: "address" },
          { name: "baseToken", type: "address" },
          { name: "pair", type: "address" },
          { name: "creator", type: "address" },
          { name: "createdAt", type: "uint256" },
          { name: "exists", type: "bool" }
        ],
        name: "",
        type: "tuple"
      }
    ]
  },
  {
    type: "function",
    name: "totalPairs",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "event",
    name: "PairCreated",
    inputs: [
      { indexed: true, name: "token", type: "address" },
      { indexed: true, name: "baseToken", type: "address" },
      { indexed: true, name: "pair", type: "address" },
      { indexed: false, name: "creator", type: "address" }
    ]
  }
] as const;

export const allowedBaseTokensAbi = [
  {
    type: "function",
    name: "isAllowed",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    type: "function",
    name: "setAllowed",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "status", type: "bool" }
    ],
    outputs: []
  }
] as const;
