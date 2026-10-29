import { ethers } from "hardhat";

const NEW_VAULT = "0xFbF6adE1BeeeF5C9B5e75051333908e1C9a0c420";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  const ReceiptToken = await ethers.getContractFactory("ReceiptToken");
  const rt = await ReceiptToken.deploy("StudSWAP Receipt", "rSTUD", deployer.address);
  await rt.waitForDeployment();
  const rtAddr = await rt.getAddress();
  console.log("New ReceiptToken deployed to:", rtAddr);

  const tx = await rt.transferOwnership(NEW_VAULT);
  await tx.wait();
  console.log("Ownership transferred to vault:", NEW_VAULT);
}

main().catch(console.error);
