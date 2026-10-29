import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const vault = await ethers.getContractAt("ReceiptVault", "0x25D3B9fc6D449989925770a1950e0dbd3f286333");
  const lp = "0x2FDBbC1c3EeB1CD91E3ced7673Ba46515f7F8580";

  try {
    const tx = await vault.depositLP(
      lp,
      ethers.parseUnits("0.001", 18),
      ethers.parseUnits("1", 18),
      { gasLimit: 500000 }
    );
    const receipt = await tx.wait();
    console.log("Success! Gas used:", receipt?.gasUsed.toString());
  } catch(e: any) {
    console.log("Error:", e.message.slice(0, 300));
  }
}

main().catch(console.error);
