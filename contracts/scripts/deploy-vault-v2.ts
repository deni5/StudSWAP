import { ethers } from "hardhat";

const RECEIPT_TOKEN = "0xA7dbAa46BDF0a591398215ef050A0EEF9ad1aC1A";
const BONUS_RESERVE_MANAGER = "0x90622F3B9cA8b3970b1768C40fdb8437E51a11A7";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Vault = await ethers.getContractFactory("ReceiptVault");
  const vault = await Vault.deploy(deployer.address, RECEIPT_TOKEN, BONUS_RESERVE_MANAGER);
  await vault.waitForDeployment();
  const addr = await vault.getAddress();
  console.log("ReceiptVault v2 deployed to:", addr);
}

main().catch(console.error);
