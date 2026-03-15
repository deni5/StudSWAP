import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  const initialOwner = deployer.address;

  // ВСТАВ СЮДИ РЕАЛЬНІ АДРЕСИ ВЖЕ ЗАДЕПЛОЄНИХ КОНТРАКТІВ У SEPOLIA
  const factoryAddress = "0xYourFactoryAddress";
  const registryAddress = "0xYourRegistryAddress";
  const allowedBaseTokensAddress = "0xYourAllowedBaseTokensAddress";

  const PairLauncher = await ethers.getContractFactory("PairLauncher");
  const pairLauncher = await PairLauncher.deploy(
    initialOwner,
    factoryAddress,
    registryAddress,
    allowedBaseTokensAddress
  );

  await pairLauncher.waitForDeployment();

  console.log("PairLauncher deployed to:", await pairLauncher.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
