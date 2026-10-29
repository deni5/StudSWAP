import { ethers } from "hardhat";

const NEW_RECEIPT_TOKEN = "0xAaeE13CF9c161331A27290313F8E8a1048f4B25F";
const BONUS_RESERVE_MANAGER = "0x90622F3B9cA8b3970b1768C40fdb8437E51a11A7";

async function main() {
  const [deployer] = await ethers.getSigners();
  const Vault = await ethers.getContractFactory("ReceiptVault");
  const vault = await Vault.deploy(deployer.address, NEW_RECEIPT_TOKEN, BONUS_RESERVE_MANAGER);
  await vault.waitForDeployment();
  const addr = await vault.getAddress();
  console.log("ReceiptVault v3 deployed to:", addr);

  // Transfer receipt token ownership to new vault
  const rt = await ethers.getContractAt(
    ["function transferOwnership(address) external"],
    NEW_RECEIPT_TOKEN
  );
  const tx = await rt.transferOwnership(addr);
  await tx.wait();
  console.log("ReceiptToken ownership transferred to vault v3");
}

main().catch(console.error);
