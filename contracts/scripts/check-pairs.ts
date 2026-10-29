import { ethers } from "hardhat";

async function main() {
  const launcher = await ethers.getContractAt(
    ["function getAllPairRecords() view returns (tuple(address token, address baseToken, address pair, address creator, uint256 createdAt, bool exists)[])"],
    "0x1228fc00cc619C2Be8EB618a9433A81962384072"
  );
  const pairs = await launcher.getAllPairRecords();
  console.log("Total pairs:", pairs.length);
  pairs.forEach((p: any, i: number) => {
    console.log(i, p.pair, "exists:", p.exists);
  });
}

main().catch(console.error);
