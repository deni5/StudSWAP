import { ethers } from "hardhat";

const WETH_SEPOLIA = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";

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
