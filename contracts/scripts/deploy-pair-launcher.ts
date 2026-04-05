import { ethers } from "hardhat";

const UNISWAP_V2_FACTORY_SEPOLIA = "0xF62c03E08ada871A0bEb309762E260a7a6a880E6";
const REGISTRY_ADDRESS = "0x21099aEcF8c318D1446431227E8D2b29b2086195";
const ALLOWED_BASE_TOKENS_ADDRESS = "0x27aa83D7390AdAA531BBEa77dD35Df06cd230dfA";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with:", deployer.address);

    const PairLauncher = await ethers.getContractFactory("PairLauncher");
    const pairLauncher = await PairLauncher.deploy(
        deployer.address,
        UNISWAP_V2_FACTORY_SEPOLIA,
        REGISTRY_ADDRESS,
        ALLOWED_BASE_TOKENS_ADDRESS
    );
    await pairLauncher.waitForDeployment();
    const address = await pairLauncher.getAddress();
    console.log("PairLauncher deployed to:", address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
