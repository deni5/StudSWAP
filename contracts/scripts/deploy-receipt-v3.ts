import { ethers } from "hardhat";

const VAULT_V4 = "0x6563Bcd36226184125fe5fFBeeA2b35db9AE54b2";

async function main() {
  const [deployer] = await ethers.getSigners();

  const ReceiptToken = await ethers.getContractFactory("ReceiptToken");
  const rt = await ReceiptToken.deploy("StudSWAP Receipt", "rSTUD", deployer.address);
  await rt.waitForDeployment();
  const rtAddr = await rt.getAddress();
  console.log("ReceiptToken v3 deployed to:", rtAddr);

  // Додаємо vault як minter
  const tx1 = await rt.setMinter(VAULT_V4, true);
  await tx1.wait();
  console.log("Vault v4 added as minter:", await rt.minters(VAULT_V4));

  // Передаємо ownership vault v4
  const tx2 = await rt.transferOwnership(VAULT_V4);
  await tx2.wait();
  console.log("Ownership transferred to vault v4");
  console.log("\nNew ReceiptToken:", rtAddr);
}

main().catch(console.error);
