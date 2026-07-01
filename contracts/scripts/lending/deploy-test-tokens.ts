import { ethers } from "hardhat";

const LENDING_CORE   = "0xc1a31202a4b7648a3B1Dc7E257f5402075b01968";
const BTC_USD_FEED   = "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43";
const MOCK_SOL_FEED  = "0x471569E9Ca6F81513Ac66829013F0Cc26091e298";
const MOCK_TRX_FEED  = "0x5193Aa7704390AbCFe07B9c24C8eF1460f1070C1";

async function main() {
  const [deployer] = await ethers.getSigners();
  const lending = await ethers.getContractAt("LendingCore", LENDING_CORE);
  const Token   = await ethers.getContractFactory("StudToken");

  // WBTC
  const wbtc = await Token.deploy("Wrapped Bitcoin", "WBTC", deployer.address);
  await wbtc.waitForDeployment();
  const wbtcAddr = await wbtc.getAddress();
  await wbtc.mint(deployer.address, ethers.parseUnits("10", 18));
  await lending.configureAsset(wbtcAddr, BTC_USD_FEED, 10800, 7000, 8000, true, false);
  console.log("WBTC:", wbtcAddr);

  // WSOL
  const wsol = await Token.deploy("Wrapped Solana", "WSOL", deployer.address);
  await wsol.waitForDeployment();
  const wsolAddr = await wsol.getAddress();
  await wsol.mint(deployer.address, ethers.parseUnits("1000", 18));
  await lending.configureAsset(wsolAddr, MOCK_SOL_FEED, 3600, 7000, 8000, true, false);
  console.log("WSOL:", wsolAddr);

  // WTRX
  const wtrx = await Token.deploy("Wrapped Tron", "WTRX", deployer.address);
  await wtrx.waitForDeployment();
  const wtrxAddr = await wtrx.getAddress();
  await wtrx.mint(deployer.address, ethers.parseUnits("100000", 18));
  await lending.configureAsset(wtrxAddr, MOCK_TRX_FEED, 3600, 7000, 8000, true, false);
  console.log("WTRX:", wtrxAddr);

  console.log("\nAdd to .env:");
  console.log("WBTC_ADDRESS=" + wbtcAddr);
  console.log("WSOL_ADDRESS=" + wsolAddr);
  console.log("WTRX_ADDRESS=" + wtrxAddr);
}

main().catch(console.error);
