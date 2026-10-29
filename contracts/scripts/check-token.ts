import { ethers } from "hardhat";

async function main() {
  const registry = await ethers.getContractAt(
    ["function isRegistered(address) view returns (bool)"],
    "0x21099aEcF8c318D1446431227E8D2b29b2086195"
  );
  const addr = "0xd129D968891410cAEE3d2a3Ef1706518DDe0E";
  const registered = await registry.isRegistered(addr);
  console.log("Is registered:", registered);
}

main().catch(console.error);
