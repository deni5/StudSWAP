import { ethers } from "hardhat";

async function main() {
  const user = "0xE862Ca4b9389d9bC306c2367A36B8Bd45f6838Bb";
  const vault = "0xf73E71b16494F88E56C6176fc7968033Af0bbC96";
  
  const pools = [
    "0x63AcD95915B014f6102aF79BE562640228139380",
    "0xf98c1D7AC19377060d1bdaf5C1A65c2348182104",
    "0xB5be92eB67179C996110c6dfdD52341D8bfc2d64",
    "0x70A6c6d9cfcD2ca685D931B032866dFd09F22CF4",
    "0x2FDBbC1c3EeB1CD91E3ced7673Ba46515f7F8580",
  ];

  const abi = ["function balanceOf(address) view returns (uint256)"];
  
  for (const pool of pools) {
    const lp = await ethers.getContractAt(abi, pool);
    const bal = await lp.balanceOf(user);
    const vaultBal = await lp.balanceOf(vault);
    if (bal > 0 || vaultBal > 0) {
      console.log(pool);
      console.log("  User:", bal.toString());
      console.log("  Vault:", vaultBal.toString());
    }
  }
}

main().catch(console.error);
