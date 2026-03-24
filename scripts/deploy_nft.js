const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying AfterGlowNFT with:", deployer.address);

  const name = "AfterGlow";
  const symbol = "AGLOW";
  const baseTokenURI = "https://example.com/metadata/"; // TODO: set your base URI

  const NFT = await ethers.getContractFactory("AfterGlowNFT");
  const nft = await NFT.deploy(name, symbol, baseTokenURI);
  await nft.deployed();

  console.log("AfterGlowNFT deployed to:", nft.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
