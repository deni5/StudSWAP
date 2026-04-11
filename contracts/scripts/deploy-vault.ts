import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // 1. BonusReserveManager
  const BRM = await ethers.getContractFactory("BonusReserveManager");
  const brm = await BRM.deploy(deployer.address);
  await brm.waitForDeployment();
  const brmAddress = await brm.getAddress();
  console.log("BonusReserveManager deployed to:", brmAddress);

  // 2. ReceiptToken
  const RT = await ethers.getContractFactory("ReceiptToken");
  const rt = await RT.deploy("StudSWAP Receipt", "rSTUD", deployer.address);
  await rt.waitForDeployment();
  const rtAddress = await rt.getAddress();
  console.log("ReceiptToken deployed to:", rtAddress);

  // 3. ReceiptVault
  const RV = await ethers.getContractFactory("ReceiptVault");
  const rv = await RV.deploy(deployer.address, rtAddress, brmAddress);
  await rv.waitForDeployment();
  const rvAddress = await rv.getAddress();
  console.log("ReceiptVault deployed to:", rvAddress);

  console.log("\nAdd to .env.local:");
  console.log("NEXT_PUBLIC_BONUS_RESERVE_MANAGER_ADDRESS=" + brmAddress);
  console.log("NEXT_PUBLIC_RECEIPT_TOKEN_ADDRESS=" + rtAddress);
  console.log("NEXT_PUBLIC_RECEIPT_VAULT_ADDRESS=" + rvAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
