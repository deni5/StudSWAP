import { ethers } from "hardhat";

async function main() {
  const user = "0xE862Ca4b9389d9bC306c2367A36B8Bd45f6838Bb";
  const newVault = "0x25D3B9fc6D449989925770a1950e0dbd3f286333";
  
  const pools = [
    "0xDC6AFBD2C8D9b0eE34569E3ef2ABDA3fA8D9241C",
    "0x2FDBbC1c3EeB1CD91E3ced7673Ba46515f7F8580",
    "0xf98c1D7AC19377060d1bdaf5C1A65c2348182104",
  ];

  const abi = [
    "function allowance(address,address) view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
  ];

  for (const pool of pools) {
    try {
      const lp = await ethers.getContractAt(abi, pool);
      const bal = await lp.balanceOf(user);
      const allow = await lp.allowance(user, newVault);
      if (bal > 0) {
        console.log("Pool:", pool.slice(0,10));
        console.log("  Balance:", bal.toString());
        console.log("  Allowance for new vault:", allow.toString());
      }
    } catch(e) {}
  }
}

main().catch(console.error);
