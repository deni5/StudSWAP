import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const PairRegistry = await ethers.getContractFactory("PairRegistry");
  const registry = await PairRegistry.deploy(deployer.address);
  await registry.waitForDeployment();
  const addr = await registry.getAddress();
  console.log("PairRegistry deployed to:", addr);
  console.log("\nAdd to .env:");
  console.log("PAIR_REGISTRY=" + addr);
}

main().catch(console.error);
