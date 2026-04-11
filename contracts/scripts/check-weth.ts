import { ethers } from "hardhat";

async function main() {
  const router = await ethers.getContractAt(
    ["function WETH() view returns (address)"],
    "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3"
  );
  const weth = await router.WETH();
  console.log("Router WETH address:", weth);
}

main().catch(console.error);
