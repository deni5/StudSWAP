import { ethers } from "hardhat";

const RECEIPT_TOKEN = "0xA7dbAa46BDF0a591398215ef050A0EEF9ad1aC1A";
const RECEIPT_VAULT = "0xf73E71b16494F88E56C6176fc7968033Af0bbC96";

async function main() {
  const [deployer] = await ethers.getSigners();

  const receiptToken = await ethers.getContractAt("ReceiptToken", RECEIPT_TOKEN);
  
  // Transfer ownership of ReceiptToken to ReceiptVault so vault can mint
  const tx = await receiptToken.transferOwnership(RECEIPT_VAULT);
  await tx.wait();
  console.log("ReceiptToken ownership transferred to ReceiptVault");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
