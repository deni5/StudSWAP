import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const vault = await ethers.getContractAt("ReceiptVault", "0xf73E71b16494F88E56C6176fc7968033Af0bbC96");
  const lp = "0x2FDBbC1c3EeB1CD91E3ced7673Ba46515f7F8580";
  
  // Approve LP
  const lpContract = await ethers.getContractAt(
    ["function approve(address,uint256) returns (bool)", "function allowance(address,address) view returns (uint256)"],
    lp
  );
  
  const allowance = await lpContract.allowance(deployer.address, "0xf73E71b16494F88E56C6176fc7968033Af0bbC96");
  console.log("Current allowance:", allowance.toString());
  
  if (allowance === BigInt(0)) {
    console.log("Approving...");
    const approveTx = await lpContract.approve("0xf73E71b16494F88E56C6176fc7968033Af0bbC96", ethers.parseUnits("0.001", 18));
    await approveTx.wait();
    console.log("Approved");
  }

  try {
    console.log("Depositing...");
    const tx = await vault.depositLP(lp, ethers.parseUnits("0.001", 18), ethers.parseUnits("1", 18), { gasLimit: 3000000 });
    await tx.wait();
    console.log("Success!");
  } catch(e: any) {
    console.log("Error:", e.message.slice(0, 200));
  }
}

main().catch(console.error);
