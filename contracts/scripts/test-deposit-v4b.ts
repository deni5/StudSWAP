import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const VAULT_V4 = "0x6563Bcd36226184125fe5fFBeeA2b35db9AE54b2";
  const LP = "0x2FDBbC1c3EeB1CD91E3ced7673Ba46515f7F8580";

  const vault = await ethers.getContractAt("ReceiptVault", VAULT_V4);
  
  // Спробуємо callStatic щоб побачити реальну помилку
  try {
    await vault.depositLP.staticCall(
      LP,
      ethers.parseUnits("0.001", 18),
      ethers.parseUnits("1", 18)
    );
    console.log("Static call OK");
  } catch(e: any) {
    console.log("Static call error:", e.message.slice(0, 300));
  }
}

main().catch(console.error);
