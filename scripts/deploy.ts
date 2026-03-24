import { ethers } from "hardhat";

async function main() {
  const admin = process.env.CONTRACT_OWNER_ADDRESS;
  if (!admin) {
    throw new Error("CONTRACT_OWNER_ADDRESS missing in .env");
  }

  const feeRecipient = process.env.FEE_RECIPIENT_ADDRESS || admin;
  const mintFeeWei = process.env.MINT_FEE_WEI || "0";

  console.log("Deploying AfterGlowAIMinter with:");
  console.log("  admin:", admin);
  console.log("  feeRecipient:", feeRecipient);
  console.log("  mintFeeWei:", mintFeeWei);

  const Factory = await ethers.getContractFactory("AfterGlowAIMinter");
  const contract = await Factory.deploy(admin, feeRecipient, mintFeeWei);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("AfterGlowAIMinter deployed to:", address);
  console.log("Set NEXT_PUBLIC_POLYGON_CONTRACT / NEXT_PUBLIC_ETHEREUM_CONTRACT to this value as appropriate.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
