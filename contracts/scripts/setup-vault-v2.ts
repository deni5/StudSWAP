import { ethers } from "hardhat";

const NEW_VAULT = "0xFbF6adE1BeeeF5C9B5e75051333908e1C9a0c420";
const RECEIPT_TOKEN = "0xA7dbAa46BDF0a591398215ef050A0EEF9ad1aC1A";

async function main() {
  const [deployer] = await ethers.getSigners();
  const receipt = await ethers.getContractAt(
    ["function transferOwnership(address) external", "function owner() view returns (address)"],
    RECEIPT_TOKEN
  );
  const owner = await receipt.owner();
  console.log("Current owner:", owner);
  
  const tx = await receipt.transferOwnership(NEW_VAULT);
  await tx.wait();
  
  const newOwner = await receipt.owner();
  console.log("New owner:", newOwner);
  console.log("Success:", newOwner.toLowerCase() === NEW_VAULT.toLowerCase());
}

main().catch(console.error);
