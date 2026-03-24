const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying PublicAITierOracle with:", deployer.address);

  const Oracle = await ethers.getContractFactory("PublicAITierOracle");
  const oracle = await Oracle.deploy(deployer.address);
  await oracle.deployed();

  console.log("PublicAITierOracle deployed to:", oracle.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
