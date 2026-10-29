import { ethers } from "hardhat";

const tokens = [
  { name: "April26", addr: "0x4e1a390057D839B52b3537305E391d4806c4FA62" },
  { name: "STUD", addr: "0xa56B7F21E8d5bBD62f6196F9C7e4b08C4c2Ca13" },
  { name: "COW", addr: "0x0625aFB445C3B6B7B929342a04A22599fd59BB59" },
];

async function main() {
  for (const t of tokens) {
    try {
      const contract = await ethers.getContractAt(
        ["function decimals() view returns (uint8)"],
        t.addr
      );
      const dec = await contract.decimals();
      console.log(t.name, "decimals:", dec.toString());
    } catch(e: any) {
      console.log(t.name, "error:", e.message);
    }
  }
}

main().catch(console.error);
