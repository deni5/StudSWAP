import { ethers } from "hardhat";

async function main() {
  const provider = ethers.provider;
  const code = await provider.getCode("0x25D3B9fc6D449989925770a1950e0dbd3f286333");
  console.log("Code length:", code.length);
  console.log("Has code:", code !== "0x");
  
  // Перевіримо nextPositionId
  const vault = await ethers.getContractAt(
    ["function nextPositionId() view returns (uint256)"],
    "0x25D3B9fc6D449989925770a1950e0dbd3f286333"
  );
  const id = await vault.nextPositionId();
  console.log("nextPositionId:", id.toString());
  
  // Перевіримо receiptToken
  const vault2 = await ethers.getContractAt(
    ["function receiptToken() view returns (address)"],
    "0x25D3B9fc6D449989925770a1950e0dbd3f286333"
  );
  const rt = await vault2.receiptToken();
  console.log("receiptToken:", rt);
}

main().catch(console.error);
