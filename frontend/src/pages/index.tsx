import { useState } from "react";
import Link from "next/link";
import { connectWallet, getContract } from "../lib/web3";

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [name, setName] = useState("AfterGlow AI NFT");
  const [description, setDescription] = useState("AI-generated artwork.");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tokenURI, setTokenURI] = useState<string | null>(null);
  const [loadingGen, setLoadingGen] = useState(false);
  const [loadingMint, setLoadingMint] = useState(false);

  async function handleConnect() {
    try {
      const addr = await connectWallet();
      setAccount(addr);
    } catch (e: any) {
      alert(e?.message || "Failed to connect wallet");
    }
  }

  async function handleGenerate() {
    setLoadingGen(true);
    setTokenURI(null);
    setImagePreview(null);

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, name, description })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.error || "Generation failed");
      }

      setTokenURI(data.tokenURI);
      setImagePreview(`https://ipfs.io/ipfs/${data.imageCid}`);
    } catch (e: any) {
      alert(e?.message || "Error generating NFT");
    } finally {
      setLoadingGen(false);
    }
  }

  async function handleMint() {
    if (!tokenURI) return;
    if (!account) {
      alert("Connect wallet first");
      return;
    }

    setLoadingMint(true);
    try {
      const { contract } = await getContract();
      const tx = await contract.mintTo(account, tokenURI);
      await tx.wait();
      alert("Minted! It should appear on marketplaces after indexing.");
    } catch (e: any) {
      alert(e?.message || "Mint failed");
    } finally {
      setLoadingMint(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-8 gap-6">
      <header className="w-full max-w-5xl flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">AfterGlow AI Minter</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/">Mint</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </header>

      <p className="text-sm text-slate-300 max-w-xl text-center">
        Describe an artwork, generate it via AI, store it on IPFS, and mint an ERC-721 NFT on-chain.
      </p>

      <div className="flex items-center gap-4">
        {account ? (
          <span className="text-xs bg-slate-800 px-3 py-1 rounded-full">
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </span>
        ) : (
          <button
            onClick={handleConnect}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-sm"
          >
            Connect MetaMask
          </button>
        )}
      </div>

      <div className="w-full max-w-xl flex flex-col gap-3">
        <label className="text-sm">
          Name
          <input
            className="w-full mt-1 px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className="text-sm">
          Description
          <input
            className="w-full mt-1 px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label className="text-sm">
          Prompt for AI
          <textarea
            className="w-full mt-1 px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm h-28"
            placeholder="e.g. glowing afterimage of a city at dusk, neon reflections, cinematic lighting"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </label>

        <button
          onClick={handleGenerate}
          disabled={loadingGen || !prompt}
          className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 text-sm disabled:opacity-50"
        >
          {loadingGen ? "Generating..." : "Generate Art + Metadata"}
        </button>
      </div>

      {imagePreview && (
        <div className="flex flex-col items-center gap-3">
          <img
            src={imagePreview}
            alt="NFT preview"
            className="w-64 h-64 object-cover rounded-lg border border-slate-700"
          />
          <button
            onClick={handleMint}
            disabled={loadingMint}
            className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-sm disabled:opacity-50"
          >
            {loadingMint ? "Minting..." : "Mint NFT"}
          </button>
        </div>
      )}
    </main>
  );
}
