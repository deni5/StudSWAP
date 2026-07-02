import { ethers } from "hardhat";

// ── Адреси ──────────────────────────────────────────────────────────
const PAIR_REGISTRY  = "0xB93fBfC49B9eee53d6ffE575A424D70f8E761644";
const LENDING_CORE   = "0xc1a31202a4b7648a3B1Dc7E257f5402075b01968";
const UNISWAP_ROUTER = "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3";
const WETH           = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
const MOCK_SOL_FEED  = "0x471569E9Ca6F81513Ac66829013F0Cc26091e298";
const MOCK_TRX_FEED  = "0x5193Aa7704390AbCFe07B9c24C8eF1460f1070C1";

const WBTC = "0x469F25921dfa340B6e426A92E1b449A519a2B538";
const WSOL = "0x3d1F69b33C97f8e1E7fA12Bc5134e2BB9DC74D56";
const WTRX = "0x18BBc0fB6C95C7bCa9008Fb72f973F72B95BAF3F";

// Студентські токени StudSWAP
const STUD = "0xa56B7F21E8d5bBD62f6196F9C7e4b08C4c2Ca13";
const COW  = "0x0625aFB445C3B6B7B929342a04A22599fd59BB59";
const OKB  = "0x3F4B4f0e7ef0e1e86a4e96c6f3E2Af4a4Fb3f80";

// ── Параметри моделі ────────────────────────────────────────────────
const RAY      = BigInt("1000000000000000000000000000");
const RHO_MIN  = 0.40;
const DELTA_MAX = 0.15;
const ALPHA    = 0.05;
const KAPPA_MIN = 0.75;
const LTV_BASE = 0.70;
const LT_BASE  = 0.80;
const GAMMA_MIN = 0.03;
const GAMMA_MAX = 0.12;
const LAMBDA_G  = 0.50;

// ── Математика ──────────────────────────────────────────────────────

function logReturns(prices: number[]): number[] {
  return prices.slice(1).map((p, i) => Math.log(p / prices[i]));
}

function pearson(x: number[], y: number[]): number {
  const n  = x.length;
  const mx = x.reduce((a, b) => a + b) / n;
  const my = y.reduce((a, b) => a + b) / n;
  const num = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0);
  const den = Math.sqrt(
    x.reduce((s, xi) => s + (xi - mx) ** 2, 0) *
    y.reduce((s, yi) => s + (yi - my) ** 2, 0)
  );
  return den === 0 ? 0 : num / den;
}

function quantile(arr: number[], q: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.floor(q * sorted.length)] ?? sorted[0];
}

function stdDev(arr: number[]): number {
  const mean = arr.reduce((a, b) => a + b) / arr.length;
  return Math.sqrt(arr.reduce((s, x) => s + (x - mean) ** 2, 0) / arr.length);
}

// ── Отримання цін ───────────────────────────────────────────────────

async function getChainlinkPrice(feedAddr: string, fallback: number): Promise<number> {
  try {
    const feed = await ethers.getContractAt(
      ["function latestRoundData() view returns (uint80,int256,uint256,uint256,uint80)",
       "function decimals() view returns (uint8)"],
      feedAddr
    );
    const [, answer] = await feed.latestRoundData();
    const dec = await feed.decimals();
    return Number(answer) / 10 ** Number(dec);
  } catch {
    console.log(`Chainlink feed ${feedAddr.slice(0,10)} unavailable, using CoinGecko fallback`);
    return fallback;
  }
}

async function getCoinGeckoCurrentPrice(id: string): Promise<number> {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
    );
    const data = await res.json();
    return data[id].usd;
  } catch {
    return 0;
  }
}

async function getCoinGeckoPrice(id: string): Promise<number> {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
    );
    const data = await res.json();
    return data[id].usd;
  } catch {
    console.log(`CoinGecko failed for ${id}, using fallback`);
    return id === "solana" ? 170 : 0.12;
  }
}

async function getStudSWAPPrice(tokenAddr: string): Promise<number | null> {
  try {
    const router = await ethers.getContractAt(
      ["function getAmountsOut(uint256,address[]) view returns (uint256[])"],
      UNISWAP_ROUTER
    );
    const amounts = await router.getAmountsOut(
      ethers.parseUnits("1", 18),
      [tokenAddr, WETH]
    );
    const ethFeed = await ethers.getContractAt(
      ["function latestRoundData() view returns (uint80,int256,uint256,uint256,uint80)"],
      "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    );
    const [, ethAnswer] = await ethFeed.latestRoundData();
    const ethPrice = Number(ethAnswer) / 1e8;
    const wethAmount = Number(ethers.formatUnits(amounts[1], 18));
    return wethAmount * ethPrice;
  } catch {
    return null;
  }
}

// ── Розрахунок параметрів пари ──────────────────────────────────────

function computePairParams(
  collPrices: number[],
  debtPrices: number[],
  collPrice: number,
  debtPrice: number
) {
  if (collPrices.length < 5 || debtPrices.length < 5) {
    // Недостатньо даних — консервативні параметри
    return {
      allowed: true,
      aCdBps: 7500,
      phiCdBps: 8125,
      effectiveLtvBps: 5688,
      effectiveLiqThBps: 6688,
      guardThresholdBps: 600,
      referenceRatioRay: (BigInt(Math.round(collPrice * 1e9)) * RAY) /
                          BigInt(Math.round(debtPrice * 1e9)),
    };
  }

  const rc = logReturns(collPrices);
  const rd = logReturns(debtPrices);
  const zcd = rc.map((r, i) => r - rd[i]);

  const rho   = pearson(rc, rd);
  const qAlpha = quantile(zcd, ALPHA);
  const sigma  = stdDev(zcd);

  const allowed = rho > RHO_MIN && qAlpha > -DELTA_MAX;

  if (!allowed) {
    return {
      allowed: false,
      aCdBps: 0, phiCdBps: 0,
      effectiveLtvBps: 0, effectiveLiqThBps: 0,
      guardThresholdBps: 1200,
      referenceRatioRay: BigInt(0),
    };
  }

  const sRho = Math.max(0, Math.min(1, (rho - RHO_MIN) / (1 - RHO_MIN)));
  const sQ   = Math.max(0, Math.min(1, (qAlpha + DELTA_MAX) / DELTA_MAX));
  const acd  = Math.min(sRho, sQ);
  const phi  = acd === 0 ? 0 : KAPPA_MIN + (1 - KAPPA_MIN) * acd;

  const ltvEff = LTV_BASE * phi;
  const ltEff  = Math.min(LT_BASE, ltvEff + (LT_BASE - LTV_BASE));
  const gamma  = Math.min(GAMMA_MAX, Math.max(GAMMA_MIN, LAMBDA_G * Math.max(0, -qAlpha)));

  const refRatio = (BigInt(Math.round(collPrice * 1e9)) * RAY) /
                    BigInt(Math.round(debtPrice * 1e9));

  return {
    allowed: true,
    aCdBps:             Math.round(acd * 10000),
    phiCdBps:           Math.round(phi * 10000),
    effectiveLtvBps:    Math.round(ltvEff * 10000),
    effectiveLiqThBps:  Math.round(ltEff * 10000),
    guardThresholdBps:  Math.round(gamma * 10000),
    referenceRatioRay:  refRatio,
  };
}

// ── Головна функція ─────────────────────────────────────────────────

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Risk updater running with:", deployer.address);

  // Крок 1 — отримуємо поточні ціни
  console.log("\n── Fetching prices ──");
  const ethCG = await getCoinGeckoCurrentPrice("ethereum");
  const ethPrice  = await getChainlinkPrice("0x694AA1769357215DE4FAC081bf1f309aDC325306", ethCG);
  const btcCG = await getCoinGeckoCurrentPrice("bitcoin");
  const btcPrice  = await getChainlinkPrice("0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43", btcCG);
  const solPrice  = await getCoinGeckoPrice("solana");
  const trxPrice  = await getCoinGeckoPrice("tron");

  console.log(`ETH: $${ethPrice.toFixed(2)}`);
  console.log(`BTC: $${btcPrice.toFixed(2)}`);
  console.log(`SOL: $${solPrice.toFixed(2)}`);
  console.log(`TRX: $${trxPrice.toFixed(4)}`);

  // Ціни студентських токенів з Uniswap
  const studPrice = await getStudSWAPPrice(STUD);
  const cowPrice  = await getStudSWAPPrice(COW);
  console.log(`STUD: ${studPrice ? '$' + studPrice.toFixed(6) : 'no pool'}`);
  console.log(`COW:  ${cowPrice  ? '$' + cowPrice.toFixed(6)  : 'no pool'}`);

  // Крок 2 — оновлюємо mock оракули
  console.log("\n── Updating mock oracles ──");
  const mockSol = await ethers.getContractAt(
    ["function updatePrice(int256) external"],
    MOCK_SOL_FEED
  );
  const mockTrx = await ethers.getContractAt(
    ["function updatePrice(int256) external"],
    MOCK_TRX_FEED
  );
  await mockSol.updatePrice(BigInt(Math.round(solPrice * 1e8)));
  console.log(`SOL feed updated: ${BigInt(Math.round(solPrice * 1e8))}`);
  await mockTrx.updatePrice(BigInt(Math.round(trxPrice * 1e8)));
  console.log(`TRX feed updated: ${BigInt(Math.round(trxPrice * 1e8))}`);

  // Крок 3 — реальні historical дані з CoinGecko (30 днів)
  console.log("\n── Fetching historical price series ──");

  async function fetchCoinGeckoHistory(id: string): Promise<number[]> {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=30&interval=daily`
      );
      const data = await res.json();
      return (data.prices as [number, number][]).map(([, price]) => price);
    } catch {
      console.log(`CoinGecko history failed for ${id}, using fallback`);
      return [];
    }
  }

  const [ethHistory, btcHistory, solHistory, trxHistory] = await Promise.all([
    fetchCoinGeckoHistory("ethereum"),
    fetchCoinGeckoHistory("bitcoin"),
    fetchCoinGeckoHistory("solana"),
    fetchCoinGeckoHistory("tron"),
  ]);

  // Вирівнюємо довжини рядів
  const minLen = Math.min(ethHistory.length, btcHistory.length, solHistory.length, trxHistory.length);
  console.log(`Historical series length: ${minLen} days`);

  const ethSeries = ethHistory.slice(-minLen);
  const btcSeries = btcHistory.slice(-minLen);
  const solSeries = solHistory.slice(-minLen);
  const trxSeries = trxHistory.slice(-minLen);

  // Крок 4 — формуємо пари і рахуємо параметри
  console.log("\n── Computing pair params ──");

  const pairs = [
    { coll: WBTC, debt: WETH, cSeries: btcSeries, dSeries: ethSeries, cPrice: btcPrice, dPrice: ethPrice, name: "WBTC/WETH" },
    { coll: WSOL, debt: WETH, cSeries: solSeries, dSeries: ethSeries, cPrice: solPrice, dPrice: ethPrice, name: "WSOL/WETH" },
    { coll: WTRX, debt: WETH, cSeries: trxSeries, dSeries: ethSeries, cPrice: trxPrice, dPrice: ethPrice, name: "WTRX/WETH" },
    { coll: WETH, debt: WBTC, cSeries: ethSeries, dSeries: btcSeries, cPrice: ethPrice, dPrice: btcPrice, name: "WETH/WBTC" },
    { coll: WSOL, debt: WBTC, cSeries: solSeries, dSeries: btcSeries, cPrice: solPrice, dPrice: btcPrice, name: "WSOL/WBTC" },
  ];

  // Додаємо студентські токени якщо є ціна
  if (studPrice) {
    const studSeries = makeNoisySeries(studPrice, 0.10);
    pairs.push({ coll: STUD, debt: WETH, cSeries: studSeries, dSeries: ethSeries, cPrice: studPrice, dPrice: ethPrice, name: "STUD/WETH" });
  }
  if (cowPrice) {
    const cowSeries = makeNoisySeries(cowPrice, 0.10);
    pairs.push({ coll: COW, debt: WETH, cSeries: cowSeries, dSeries: ethSeries, cPrice: cowPrice, dPrice: ethPrice, name: "COW/WETH" });
  }

  const updates = [];
  for (const pair of pairs) {
    const params = computePairParams(pair.cSeries, pair.dSeries, pair.cPrice, pair.dPrice);
    console.log(`${pair.name}: allowed=${params.allowed} LTV=${params.effectiveLtvBps/100}% LT=${params.effectiveLiqThBps/100}% guard=${params.guardThresholdBps/100}%`);
    updates.push({
      collateralAsset:    pair.coll,
      debtAsset:          pair.debt,
      allowed:            params.allowed,
      aCdBps:             params.aCdBps,
      phiCdBps:           params.phiCdBps,
      effectiveLtvBps:    params.effectiveLtvBps,
      effectiveLiqThBps:  params.effectiveLiqThBps,
      guardThresholdBps:  params.guardThresholdBps,
      referenceRatioRay:  params.referenceRatioRay,
      updatedAt:          BigInt(Math.floor(Date.now() / 1000)),
    });
  }

  // Крок 5 — відправляємо батч в PairRegistry
  console.log("\n── Submitting batch to PairRegistry ──");
  const registry = await ethers.getContractAt("PairRegistry", PAIR_REGISTRY);
  const epoch    = BigInt(Math.floor(Date.now() / 1000));
  const tx       = await registry.batchUpdatePairs(updates, epoch);
  await tx.wait();
  console.log(`Batch submitted: ${updates.length} pairs, epoch=${epoch}`);
  console.log("Risk updater completed successfully");
}

main().catch(console.error);
