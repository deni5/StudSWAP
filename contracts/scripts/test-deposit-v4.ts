import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const VAULT_V4 = "0x6563Bcd36226184125fe5fFBeeA2b35db9AE54b2";
  const LP = "0x2FDBbC1c3EeB1CD91E3ced7673Ba46515f7F8580";

  // Approve
  const lp = await ethers.getContractAt(
    ["function approve(address,uint256) returns (bool)", "function allowance(address,address) view returns (uint256)"],
    LP
  );
  const allow = await lp.allowance(deployer.address, VAULT_V4);
  console.log("Current allowance:", allow.toString());
  
  if (allow < ethers.parseUnits("0.001", 18)) {
    const tx = await lp.approve(VAULT_V4, ethers.parseUnits("1", 18));
    await tx.wait();
    console.log("Approved");
  }

  const vault = await ethers.getContractAt("ReceiptVault", VAULT_V4);
  try {
    const tx = await vault.depositLP(LP, ethers.parseUnits("0.001", 18), ethers.parseUnits("1", 18), { gasLimit: 500000 });
    const receipt = await tx.wait();
    console.log("Success! Gas used:", receipt?.gasUsed.toString());
  } catch(e: any) {
    console.log("Error:", e.message.slice(0, 200));
  }
}

main().catch(console.error);
