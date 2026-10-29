import { ethers } from "hardhat";

const VAULT_V3 = "0x25D3B9fc6D449989925770a1950e0dbd3f286333";
const RECEIPT_TOKEN = "0xAaeE13CF9c161331A27290313F8E8a1048f4B25F";

async function main() {
  const [deployer] = await ethers.getSigners();

  // ReceiptToken owner is Vault v2 — but Vault v2 has no function to call transferOwnership on receipt
  // So we deploy fresh ReceiptToken owned by deployer, then transfer to vault v3
  const ReceiptToken = await ethers.getContractFactory("ReceiptToken");
  const rt = await ReceiptToken.deploy("StudSWAP Receipt", "rSTUD", deployer.address);
  await rt.waitForDeployment();
  const rtAddr = await rt.getAddress();
  console.log("Fresh ReceiptToken:", rtAddr);

  const tx = await rt.transferOwnership(VAULT_V3);
  await tx.wait();
  console.log("Transferred to Vault v3:", VAULT_V3);
  console.log("\nUpdate .env.local:");
  console.log("NEXT_PUBLIC_RECEIPT_VAULT_ADDRESS=" + VAULT_V3);
  console.log("NEXT_PUBLIC_RECEIPT_TOKEN_ADDRESS=" + rtAddr);
}

main().catch(console.error);
