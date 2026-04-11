import { ethers } from "hardhat";

async function main() {
  const router = await ethers.getContractAt(
    [
      "function WETH() view returns (address)",
      "function factory() view returns (address)",
    ],
    "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3"
  );
  const weth = await router.WETH();
  const factory = await router.factory();
  console.log("WETH:", weth);
  console.log("Factory:", factory);
}

main().catch(console.error);
