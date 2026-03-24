import { ethers } from "hardhat";

async function main() {
  const owner = process.env.CONTRACT_OWNER_ADDRESS;
  if (!owner) {
    throw new Error("CONTRACT_OWNER_ADDRESS missing in .env");
  }

  console.log("Deploying AfterGlowAIMinter with owner:", owner);

  const Factory = await ethers.getContractFactory("AfterGlowAIMinter");
  const contract = await Factory.deploy(owner);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("AfterGlowAIMinter deployed to:", address);
  console.log("Set NEXT_PUBLIC_CONTRACT_ADDRESS to this value in .env and frontend/.env.local");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
