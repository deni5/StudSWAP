import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  const Registry = await ethers.getContractFactory("StudentTokenRegistry");
  const registry = await Registry.deploy(deployer.address);

  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("StudentTokenRegistry deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

