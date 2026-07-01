import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const MockFeed = await ethers.getContractFactory("MockPriceFeed");

  const solFeed = await MockFeed.deploy("SOL / USD");
  await solFeed.waitForDeployment();
  const solAddr = await solFeed.getAddress();
  console.log("MockPriceFeed SOL/USD:", solAddr);

  const trxFeed = await MockFeed.deploy("TRX / USD");
  await trxFeed.waitForDeployment();
  const trxAddr = await trxFeed.getAddress();
  console.log("MockPriceFeed TRX/USD:", trxAddr);

  await solFeed.updatePrice(17000000000n);
  await trxFeed.updatePrice(12000000n);
  console.log("Initial prices set");

  console.log("\nAdd to .env:");
  console.log("MOCK_SOL_FEED=" + solAddr);
  console.log("MOCK_TRX_FEED=" + trxAddr);
}

main().catch(console.error);
