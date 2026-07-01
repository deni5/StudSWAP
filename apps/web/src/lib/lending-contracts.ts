export const LENDING_CORE_ADDRESS = process.env.NEXT_PUBLIC_LENDING_CORE as `0x${string}`;
export const PAIR_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_PAIR_REGISTRY as `0x${string}`;

export const WBTC_ADDRESS = process.env.NEXT_PUBLIC_WBTC_ADDRESS as `0x${string}`;
export const WSOL_ADDRESS = process.env.NEXT_PUBLIC_WSOL_ADDRESS as `0x${string}`;
export const WTRX_ADDRESS = process.env.NEXT_PUBLIC_WTRX_ADDRESS as `0x${string}`;

export const lendingAssets = [
  { address: process.env.NEXT_PUBLIC_WBTC_ADDRESS as `0x${string}`, symbol: "WBTC", name: "Wrapped Bitcoin", decimals: 18 },
  { address: process.env.NEXT_PUBLIC_WSOL_ADDRESS as `0x${string}`, symbol: "WSOL", name: "Wrapped Solana",  decimals: 18 },
  { address: process.env.NEXT_PUBLIC_WTRX_ADDRESS as `0x${string}`, symbol: "WTRX", name: "Wrapped Tron",    decimals: 18 },
  { address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14" as `0x${string}`, symbol: "ETH",  name: "SepoliaETH",     decimals: 18 },
];

export const lendingCoreAbi = [
  {
    name: "getHealthFactor", type: "function", stateMutability: "view",
    inputs: [
      { name: "user",            type: "address" },
      { name: "collateralAsset", type: "address" },
      { name: "debtAsset",       type: "address" },
    ],
    outputs: [{ name: "hfRay", type: "uint256" }],
  },
  {
    name: "getLiquidationPrice", type: "function", stateMutability: "view",
    inputs: [
      { name: "user",            type: "address" },
      { name: "collateralAsset", type: "address" },
      { name: "debtAsset",       type: "address" },
    ],
    outputs: [{ name: "priceLiqRay", type: "uint256" }],
  },
  {
    name: "getBorrowRate", type: "function", stateMutability: "view",
    inputs: [{ name: "debtAsset", type: "address" }],
    outputs: [{ name: "rateRay", type: "uint256" }],
  },
  {
    name: "isGuardActive", type: "function", stateMutability: "view",
    inputs: [
      { name: "collateralAsset", type: "address" },
      { name: "debtAsset",       type: "address" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "positions", type: "function", stateMutability: "view",
    inputs: [
      { name: "user",            type: "address" },
      { name: "collateralAsset", type: "address" },
      { name: "debtAsset",       type: "address" },
    ],
    outputs: [{
      type: "tuple",
      components: [
        { name: "collateralAmount", type: "uint128" },
        { name: "scaledDebt",       type: "uint128" },
        { name: "collateralAsset",  type: "address" },
        { name: "debtAsset",        type: "address" },
        { name: "openedAt",         type: "uint64"  },
        { name: "updatedAt",        type: "uint64"  },
      ],
    }],
  },
  {
    name: "marketStates", type: "function", stateMutability: "view",
    inputs: [{ name: "asset", type: "address" }],
    outputs: [{
      type: "tuple",
      components: [
        { name: "totalLiquidityShares",  type: "uint128" },
        { name: "totalScaledDebt",       type: "uint128" },
        { name: "borrowIndexRay",        type: "uint128" },
        { name: "reserveBalance",        type: "uint128" },
        { name: "lastAccrualTimestamp",  type: "uint64"  },
        { name: "lastUtilizationBps",    type: "uint16"  },
        { name: "optimalUtilizationBps", type: "uint16"  },
        { name: "slope1Bps",             type: "uint16"  },
        { name: "slope2Bps",             type: "uint16"  },
        { name: "baseRateBps",           type: "uint16"  },
        { name: "borrowPaused",          type: "bool"    },
        { name: "withdrawPaused",        type: "bool"    },
      ],
    }],
  },
  {
    name: "supplyLiquidity", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "debtAsset", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    name: "depositCollateral", type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "collateralAsset", type: "address" },
      { name: "debtAsset",       type: "address" },
      { name: "amount",          type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "borrow", type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "collateralAsset", type: "address" },
      { name: "debtAsset",       type: "address" },
      { name: "amount",          type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "repay", type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "collateralAsset", type: "address" },
      { name: "debtAsset",       type: "address" },
      { name: "amount",          type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "withdrawCollateral", type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "collateralAsset", type: "address" },
      { name: "debtAsset",       type: "address" },
      { name: "amount",          type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "liquidate", type: "function", stateMutability: "nonpayable",
    inputs: [
      { name: "borrower",        type: "address" },
      { name: "collateralAsset", type: "address" },
      { name: "debtAsset",       type: "address" },
      { name: "repayAmount",     type: "uint256" },
    ],
    outputs: [],
  },
] as const;

export const pairRegistryAbi = [
  {
    name: "getPairConfig", type: "function", stateMutability: "view",
    inputs: [
      { name: "collateralAsset", type: "address" },
      { name: "debtAsset",       type: "address" },
    ],
    outputs: [{
      type: "tuple",
      components: [
        { name: "allowed",              type: "bool"    },
        { name: "aCdBps",               type: "uint16"  },
        { name: "phiCdBps",             type: "uint16"  },
        { name: "effectiveLtvBps",      type: "uint16"  },
        { name: "effectiveLiqThBps",    type: "uint16"  },
        { name: "guardThresholdBps",    type: "uint32"  },
        { name: "referenceRatioRay",    type: "uint128" },
        { name: "updatedAt",            type: "uint64"  },
        { name: "epoch",                type: "uint64"  },
      ],
    }],
  },
  {
    name: "isPairAllowed", type: "function", stateMutability: "view",
    inputs: [
      { name: "collateralAsset", type: "address" },
      { name: "debtAsset",       type: "address" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;
