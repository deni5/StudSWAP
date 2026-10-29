import { ethers } from "hardhat";

async function main() {
  const receipt = await ethers.getContractAt(
    ["function owner() view returns (address)"],
    "0xA7dbAa46BDF0a591398215ef050A0EEF9ad1aC1A"
  );
  const vault = await ethers.getContractAt(
    ["function receiptToken() view returns (address)"],
    "0xf73E71b16494F88E56C6176fc7968033Af0bbC96"
  );
  const owner = await receipt.owner();
  const rt = await vault.receiptToken();
  console.log("ReceiptToken owner:", owner);
  console.log("Vault receiptToken:", rt);
  console.log("Vault address:", "0xf73E71b16494F88E56C6176fc7968033Af0bbC96");
  console.log("Owner is vault:", owner.toLowerCase() === "0xf73E71b16494F88E56C6176fc7968033Af0bbC96".toLowerCase());
}

main().catch(console.error);
