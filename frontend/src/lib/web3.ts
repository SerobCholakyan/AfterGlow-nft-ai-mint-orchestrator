import { BrowserProvider, Contract } from "ethers";
import abiJson from "../../../artifacts/contracts/AfterGlowAIMinter.sol/AfterGlowAIMinter.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "137");

/**
 * Get a connected contract instance using MetaMask.
 */
export async function getContract() {
  const anyWindow = window as any;
  if (!anyWindow.ethereum) {
    throw new Error("MetaMask not found. Please install MetaMask.");
  }

  const provider = new BrowserProvider(anyWindow.ethereum);
  const network = await provider.getNetwork();

  if (network.chainId !== BigInt(CHAIN_ID)) {
    throw new Error(`Wrong network. Please switch MetaMask to chainId ${CHAIN_ID}.`);
  }

  const signer = await provider.getSigner();
  const contract = new Contract(CONTRACT_ADDRESS, abiJson.abi, signer);
  return { contract, signer };
}

/**
 * Request account access via MetaMask and return the first account.
 */
export async function connectWallet(): Promise<string> {
  const anyWindow = window as any;
  if (!anyWindow.ethereum) {
    throw new Error("MetaMask not found. Please install MetaMask.");
  }

  const accounts = await anyWindow.ethereum.request({
    method: "eth_requestAccounts"
  });

  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts returned from MetaMask.");
  }

  return accounts[0];
}


Run npx hardhat compile at the repo root so artifacts/contracts/AfterGlowAIMinter.sol/AfterGlowAIMinter.json exists.
