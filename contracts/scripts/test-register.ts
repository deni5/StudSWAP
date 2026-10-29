import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const registry = await ethers.getContractAt(
    "StudentTokenRegistry",
    "0x21099aEcF8c318D1446431227E8D2b29b2086195"
  );
  
  const tokenAddress = "0x4e1a390057D839B52b3537305E391d4806c4FA62";
  const weth = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";

  try {
    const tx = await registry.registerToken(
      tokenAddress, "A-token", "A", "A-token", "Findep", "", weth, false,
      "0x0000000000000000000000000000000000000000", 0
    );
    await tx.wait();
    console.log("Registered successfully");
  } catch(e: any) {
    console.log("Error:", e.message);
  }
}

main().catch(console.error);
