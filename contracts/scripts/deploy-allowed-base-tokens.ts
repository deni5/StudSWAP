import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const AllowedBaseTokens = await ethers.getContractFactory("AllowedBaseTokens");
    const allowedBaseTokens = await AllowedBaseTokens.deploy();
    await allowedBaseTokens.deployed();
    console.log("AllowedBaseTokens deployed to:", allowedBaseTokens.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
