import { ethers } from "hardhat";

const OLD_VAULT = "0xf73E71b16494F88E56C6176fc7968033Af0bbC96";
const NEW_VAULT = "0xFbF6adE1BeeeF5C9B5e75051333908e1C9a0c420";
const RECEIPT_TOKEN = "0xA7dbAa46BDF0a591398215ef050A0EEF9ad1aC1A";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  // Через старий vault викликаємо transferOwnership на receipt token
  // Старий vault є owner ReceiptVault (Ownable) — deployer є owner vault
  const oldVault = await ethers.getContractAt(
    ["function owner() view returns (address)"],
    OLD_VAULT
  );
  const vaultOwner = await oldVault.owner();
  console.log("Old vault owner:", vaultOwner);
  console.log("Deployer:", deployer.address);
  
  // Нам треба задеплоїти новий ReceiptToken і передати його новому vault
  // АБО задеплоїти новий ReceiptToken
  const ReceiptToken = await ethers.getContractFactory("ReceiptToken");
  const newReceiptToken = await ReceiptToken.deploy(deployer.address);
  await newReceiptToken.waitForDeployment();
  const newRTAddr = await newReceiptToken.getAddress();
  console.log("New ReceiptToken deployed to:", newRTAddr);
  
  // Передаємо новий receipt token новому vault
  const tx = await newReceiptToken.transferOwnership(NEW_VAULT);
  await tx.wait();
  console.log("Ownership transferred to new vault");
}

main().catch(console.error);
