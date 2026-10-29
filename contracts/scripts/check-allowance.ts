import { ethers } from "hardhat";

async function main() {
  const user = "0xE862Ca4b9389d9bC306c2367A36B8Bd45f6838Bb";
  const vault = "0xf73E71b16494F88E56C6176fc7968033Af0bbC96";
  const lp = "0x2FDBbC1c3EeB1CD91E3ced7673Ba46515f7F8580";
  
  const abi = ["function allowance(address owner, address spender) view returns (uint256)"];
  const contract = await ethers.getContractAt(abi, lp);
  const allowance = await contract.allowance(user, vault);
  console.log("LP allowance for Vault:", allowance.toString());
}

main().catch(console.error);
