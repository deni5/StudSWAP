import { ethers } from "hardhat";

const WETH_SEPOLIA = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const AllowedBaseTokens = await ethers.getContractFactory("AllowedBaseTokens");
    const allowedBaseTokens = await AllowedBaseTokens.deploy(WETH_SEPOLIA);
    await allowedBaseTokens.waitForDeployment();
    const address = await allowedBaseTokens.getAddress();
    console.log("AllowedBaseTokens deployed to:", address);
    console.log("WETH address used:", WETH_SEPOLIA);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
