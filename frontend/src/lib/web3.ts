import { BrowserProvider, Contract } from "ethers";
import abiJson from "../../../artifacts/contracts/AfterGlowAIMinter.sol/AfterGlowAIMinter.json";

const DEFAULT_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "137");

const CONTRACTS: Record<number, string> = {
  1: process.env.NEXT_PUBLIC_ETHEREUM_CONTRACT || "",
  137: process.env.NEXT_PUBLIC_POLYGON_CONTRACT || ""
};

function getStoredChainId(): number {
  if (typeof window === "undefined") return DEFAULT_CHAIN_ID;
  const stored = window.localStorage.getItem("afterglow_chain_id");
  return stored ? Number(stored) : DEFAULT_CHAIN_ID;
}

export function setStoredChainId(id: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("afterglow_chain_id", String(id));
}

export function getLastAccount(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("afterglow_last_account");
}

async function ensureNetwork(anyWindow: any, chainId: number) {
  const targetChainIdHex = "0x" + chainId.toString(16);
  try {
    await anyWindow.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: targetChainIdHex }]
    });
  } catch (e: any) {
    // Optionally handle addChain here if needed
  }
}

export async function getContract(chainIdOverride?: number) {
  const anyWindow = window as any;
  if (!anyWindow.ethereum) {
    throw new Error("MetaMask not found. Please install MetaMask.");
  }

  const chainId = chainIdOverride ?? getStoredChainId();
  await ensureNetwork(anyWindow, chainId);

  const provider = new BrowserProvider(anyWindow.ethereum);
  const signer = await provider.getSigner();

  const contractAddress =
    CONTRACTS[chainId] || process.env.NEXT_PUBLIC_POLYGON_CONTRACT || process.env.NEXT_PUBLIC_ETHEREUM_CONTRACT;

  if (!contractAddress) {
    throw new Error("Contract address not configured for selected chain.");
  }

  const contract = new Contract(contractAddress, abiJson.abi, signer);
  return { contract, signer, chainId };
}

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

  const addr = accounts[0];
  if (typeof window !== "undefined") {
    window.localStorage.setItem("afterglow_last_account", addr);
  }
  return addr;
}
