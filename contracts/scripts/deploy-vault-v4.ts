import { ethers } from "hardhat";

const RECEIPT_TOKEN = "0x063A64Df665079c5CA74F80b614c3b616eB43C7B";
const BONUS_RESERVE_MANAGER = "0x90622F3B9cA8b3970b1768C40fdb8437E51a11A7";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Vault = await ethers.getContractFactory("ReceiptVault");
  const vault = await Vault.deploy(deployer.address, RECEIPT_TOKEN, BONUS_RESERVE_MANAGER);
  await vault.waitForDeployment();
  const addr = await vault.getAddress();
  console.log("ReceiptVault v4 deployed to:", addr);
  
  // Verify receipt token
  const v = await ethers.getContractAt(["function receiptToken() view returns (address)"], addr);
  const rt = await v.receiptToken();
  console.log("receiptToken:", rt);
  console.log("Correct:", rt.toLowerCase() === RECEIPT_TOKEN.toLowerCase());
  
  console.log("\nUpdate vault/page.tsx:");
  console.log("RECEIPT_VAULT =", addr);
}

main().catch(console.error);
