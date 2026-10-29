import { ethers } from "hardhat";

async function main() {
  // Офіційний Uniswap V2 Router02 на Sepolia
  const routers = [
    "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3", // поточний
    "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008", // інший відомий
  ];
  
  for (const r of routers) {
    try {
      const router = await ethers.getContractAt(
        ["function WETH() view returns (address)"],
        r
      );
      const weth = await router.WETH();
      console.log(r, "WETH:", weth);
    } catch(e: any) {
      console.log(r, "error:", e.message.slice(0, 50));
    }
  }
}

main().catch(console.error);
