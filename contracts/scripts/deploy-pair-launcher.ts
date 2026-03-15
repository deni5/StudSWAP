import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  const initialOwner = deployer.address;
  const factoryAddress = "0xFACTORY_HERE";
  const registryAddress = "0x731A9095F79b1F7D335eF741281ac35eC84B8d0a";
  const allowedBaseTokensAddress = "0xALLOWED_BASE_TOKENS_HERE";

  console.log("Deploying with:", deployer.address);
  console.log("initialOwner:", initialOwner);
  console.log("factoryAddress:", factoryAddress);
  console.log("registryAddress:", registryAddress);
  console.log("allowedBaseTokensAddress:", allowedBaseTokensAddress);

  const Factory = await ethers.getContractFactory("PairLauncher");
  const contract = await Factory.deploy(
    initialOwner,
    factoryAddress,
    registryAddress,
    allowedBaseTokensAddress
  );

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("PairLauncher deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
