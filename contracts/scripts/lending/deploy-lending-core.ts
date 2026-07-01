import { ethers } from "hardhat";

const PAIR_REGISTRY = "0xB93fBfC49B9eee53d6ffE575A424D70f8E761644";

// Chainlink Sepolia
const ETH_USD_FEED = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
const BTC_USD_FEED = "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43";

// Mock feeds
const MOCK_SOL_FEED = "0x471569E9Ca6F81513Ac66829013F0Cc26091e298";
const MOCK_TRX_FEED = "0x5193Aa7704390AbCFe07B9c24C8eF1460f1070C1";

// Токени
const WETH = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const LendingCore = await ethers.getContractFactory("LendingCore");
  const lending = await LendingCore.deploy(deployer.address, deployer.address);
  await lending.waitForDeployment();
  const addr = await lending.getAddress();
  console.log("LendingCore deployed to:", addr);

  // Крок 5 — setPairRegistry
  await lending.setPairRegistry(PAIR_REGISTRY);
  console.log("PairRegistry set");

  // Крок 6 — WETH
  await lending.configureAsset(WETH, ETH_USD_FEED, 10800, 7000, 8000, true, false);
  console.log("WETH configured");

  // Крок 10 — RiskParams
  await lending.setRiskParams(1000, 5000, 500);
  console.log("RiskParams set");

  console.log("\nAdd to .env:");
  console.log("LENDING_CORE=" + addr);
}

main().catch(console.error);
