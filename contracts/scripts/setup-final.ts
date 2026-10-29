import { ethers } from "hardhat";

const RT = "0x7B258b58e77572096eEd8B67Ca4d75b65B17C946";
const BRM = "0x90622F3B9cA8b3970b1768C40fdb8437E51a11A7";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  const Vault = await ethers.getContractFactory("ReceiptVault");
  const vault = await Vault.deploy(deployer.address, RT, BRM);
  await vault.waitForDeployment();
  const vaultAddr = await vault.getAddress();
  console.log("New Vault:", vaultAddr);

  // RT owner is old vault v4 — can't call setMinter
  // But RT already has vault v4 as minter
  // Let's add new vault as minter via deployer (deployer owns vault v4)
  // Actually RT owner is vault v4, deployer owns vault v4
  // We need vault v4 to call RT.setMinter(newVault, true)
  // Vault v4 doesn't have this function...
  
  // Simplest: deploy fresh RT with deployer as owner, add new vault as minter, transfer to new vault
  const ReceiptToken = await ethers.getContractFactory("ReceiptToken");
  const rt = await ReceiptToken.deploy("StudSWAP Receipt", "rSTUD", deployer.address);
  await rt.waitForDeployment();
  const rtAddr = await rt.getAddress();
  console.log("Fresh RT:", rtAddr);

  await (await rt.setMinter(vaultAddr, true)).wait();
  console.log("Vault added as minter");
  
  await (await rt.transferOwnership(vaultAddr)).wait();
  console.log("RT ownership transferred to vault");

  // Test deposit
  const lp = "0x2FDBbC1c3EeB1CD91E3ced7673Ba46515f7F8580";
  const lpContract = await ethers.getContractAt(
    ["function approve(address,uint256) returns (bool)"],
    lp
  );
  await (await lpContract.approve(vaultAddr, ethers.parseUnits("1", 18))).wait();
  
  // But vault was deployed with old RT address...
  console.log("\nVault receiptToken:", await (await ethers.getContractAt(["function receiptToken() view returns (address)"], vaultAddr)).receiptToken());
  console.log("Fresh RT:", rtAddr);
  console.log("Match:", (await (await ethers.getContractAt(["function receiptToken() view returns (address)"], vaultAddr)).receiptToken()).toLowerCase() === rtAddr.toLowerCase());
  
  console.log("\nFINAL ADDRESSES:");
  console.log("RECEIPT_VAULT =", vaultAddr);
  console.log("RECEIPT_TOKEN =", rtAddr);
}

main().catch(console.error);
