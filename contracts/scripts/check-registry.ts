import { ethers } from "hardhat";

async function main() {
  const registry = await ethers.getContractAt(
    ["function allowedBaseTokens() view returns (address)"],
    "0x21099aEcF8c318D1446431227E8D2b29b2086195"
  );
  try {
    const abt = await registry.allowedBaseTokens();
    console.log("AllowedBaseTokens in Registry:", abt);
  } catch(e) {
    console.log("No allowedBaseTokens field:", e);
  }
}

main().catch(console.error);
