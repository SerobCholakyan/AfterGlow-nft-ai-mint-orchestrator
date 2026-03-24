const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying PublicNFTAccountModule with:", deployer.address);

  const registryAddress = "0x..."; // TODO: set ERC-6551 registry address
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;

  const Module = await ethers.getContractFactory("PublicNFTAccountModule");
  const module = await Module.deploy(registryAddress, chainId);
  await module.deployed();

  console.log("PublicNFTAccountModule deployed to:", module.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
