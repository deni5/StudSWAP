import { ethers } from "hardhat";

const RECEIPT_TOKEN = "0x063A64Df665079c5CA74F80b614c3b616eB43C7B";
const VAULT_V4 = "0x6563Bcd36226184125fe5fFBeeA2b35db9AE54b2";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  const rt = await ethers.getContractAt(
    [
      "function setMinter(address account, bool allowed) external",
      "function minters(address) view returns (bool)",
      "function owner() view returns (address)",
    ],
    RECEIPT_TOKEN
  );
  
  const owner = await rt.owner();
  console.log("Owner:", owner);
  console.log("Deployer:", deployer.address);
  console.log("Is minter before:", await rt.minters(VAULT_V4));
  
  // owner is vault v4, need to call via vault
  // But deployer owns vault v4 (Ownable)
  // ReceiptToken.setMinter is called by owner of ReceiptToken = Vault v4
  // We need vault to call setMinter on receipt token
  // Let's check if vault has this function
  const vault = await ethers.getContractAt(
    ["function owner() view returns (address)"],
    VAULT_V4
  );
  const vaultOwner = await vault.owner();
  console.log("Vault owner:", vaultOwner);
}

main().catch(console.error);
