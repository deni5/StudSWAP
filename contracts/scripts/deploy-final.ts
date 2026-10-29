import { ethers } from "hardhat";

const BRM = "0x90622F3B9cA8b3970b1768C40fdb8437E51a11A7";

async function main() {
  const [deployer] = await ethers.getSigners();

  // 1. Deploy RT
  const ReceiptToken = await ethers.getContractFactory("ReceiptToken");
  const rt = await ReceiptToken.deploy("StudSWAP Receipt", "rSTUD", deployer.address);
  await rt.waitForDeployment();
  const rtAddr = await rt.getAddress();
  console.log("RT:", rtAddr);

  // 2. Deploy Vault with this RT
  const Vault = await ethers.getContractFactory("ReceiptVault");
  const vault = await Vault.deploy(deployer.address, rtAddr, BRM);
  await vault.waitForDeployment();
  const vaultAddr = await vault.getAddress();
  console.log("Vault:", vaultAddr);

  // 3. Add vault as minter
  await (await rt.setMinter(vaultAddr, true)).wait();
  console.log("Minter added:", await rt.minters(vaultAddr));

  // 4. Transfer RT ownership to vault
  await (await rt.transferOwnership(vaultAddr)).wait();
  console.log("RT owner:", await rt.owner());

  // 5. Test depositLP
  const lp = "0x2FDBbC1c3EeB1CD91E3ced7673Ba46515f7F8580";
  const lpC = await ethers.getContractAt(["function approve(address,uint256) returns (bool)"], lp);
  await (await lpC.approve(vaultAddr, ethers.parseUnits("1", 18))).wait();

  try {
    const tx = await vault.depositLP(lp, ethers.parseUnits("0.001", 18), ethers.parseUnits("1", 18), { gasLimit: 500000 });
    await tx.wait();
    console.log("depositLP SUCCESS!");
    const nextId = await vault.nextPositionId();
    console.log("nextPositionId:", nextId.toString());
  } catch(e: any) {
    console.log("depositLP error:", e.message.slice(0, 200));
  }

  console.log("\nFINAL:");
  console.log("RECEIPT_VAULT =", vaultAddr);
  console.log("RECEIPT_TOKEN =", rtAddr);
}

main().catch(console.error);
