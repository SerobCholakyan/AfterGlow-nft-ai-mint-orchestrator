import { useEffect, useState } from "react";
import Link from "next/link";
import { connectWallet, getContract, getLastAccount, setStoredChainId } from "../lib/web3";
import { ipfsToHttp } from "../lib/ipfs";

const PRESETS = [
  "AfterGlow Neon city at night, glowing reflections, cinematic",
  "Cosmic fractal light, deep blues and purples, ethereal",
  "Minimalist glowing line art on dark background",
  "Cyberpunk alley, neon rain, reflective puddles"
];

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number>(Number(process.env.NEXT_PUBLIC_CHAIN_ID || "137"));

  const [prompt, setPrompt] = useState("");
  const [name, setName] = useState("AfterGlow AI NFT");
  const [description, setDescription] = useState("AI-generated artwork.");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [count, setCount] = useState(2);

  const [images, setImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [tokenURI, setTokenURI] = useState<string | null>(null);

  const [loadingGen, setLoadingGen] = useState(false);
  const [loadingMint, setLoadingMint] = useState(false);

  useEffect(() => {
    const last = getLastAccount();
    if (last) setAccount(last);

    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("afterglow_chain_id");
      if (stored) setChainId(Number(stored));
    }
  }, []);

  function switchChain(id: number) {
    setChainId(id);
    setStoredChainId(id);
  }

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
    setImages([]);
    setSelectedImageIndex(null);

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-afterglow-key": process.env.NEXT_PUBLIC_AFTERGLOW_DUMMY || "" // optional: expose a public alias or set header in proxy
        },
        body: JSON.stringify({ prompt, name, description, negativePrompt, count })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.error || "Generation failed");
      }

      setTokenURI(data.tokenURI);
      setImages(data.imageCids.map((cid: string) => ipfsToHttp(`ipfs://${cid}`)));
      setSelectedImageIndex(0);
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
      const { contract } = await getContract(chainId);
      const tx = await contract.mintTo(account, tokenURI, { value: 0 }); // adjust if you set mintFee > 0
      await tx.wait();
      alert("Minted! It should appear on marketplaces after indexing.");
    } catch (e: any) {
      alert(e?.message || "Mint failed");
    } finally {
      setLoadingMint(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-4 sm:p-8 gap-6">
      <header className="w-full max-w-5xl flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold">AfterGlow AI Minter</h1>
          <p className="text-xs text-slate-400">
            Multi-chain AI NFT minting on Ethereum & Polygon.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => switchChain(1)}
              className={`px-2 py-1 rounded ${
                chainId === 1 ? "bg-green-600" : "bg-slate-800"
              }`}
            >
              Ethereum
            </button>
            <button
              onClick={() => switchChain(137)}
              className={`px-2 py-1 rounded ${
                chainId === 137 ? "bg-green-600" : "bg-slate-800"
              }`}
            >
              Polygon
            </button>
          </div>
          <nav className="flex gap-4 text-sm">
            <Link href="/">Mint</Link>
            <Link href="/gallery">Gallery</Link>
            <Link href="/admin">Admin</Link>
          </nav>
        </div>
      </header>

      <p className="text-sm text-slate-300 max-w-xl text-center">
        Describe an artwork, generate multiple AI variations, store on IPFS, and mint an ERC-721 NFT
        on your chosen chain.
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

        <div className="flex flex-col gap-2 text-sm">
          <span>Prompt presets</span>
          <div className="flex flex-wrap gap-2 text-xs">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrompt(p)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <label className="text-sm">
          Prompt for AI
          <textarea
            className="w-full mt-1 px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm h-28"
            placeholder="e.g. glowing afterimage of a city at dusk, neon reflections, cinematic lighting"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </label>

        <label className="text-sm">
          Negative prompt
          <input
            className="w-full mt-1 px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm"
            placeholder="e.g. blurry, distorted, low quality"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
          />
        </label>

        <label className="text-sm">
          Number of variations (1–4)
          <input
            type="number"
            min={1}
            max={4}
            className="w-full mt-1 px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
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

      {images.length > 0 && (
        <div className="w-full max-w-3xl flex flex-col gap-4">
          <p className="text-sm text-slate-300">Select one variation to mint:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {images.map((src, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`cursor-pointer border rounded-lg p-1 ${
                  selectedImageIndex === idx ? "border-green-500" : "border-slate-700"
                }`}
              >
                <img
                  src={src}
                  alt={`Variation ${idx + 1}`}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleMint}
              disabled={loadingMint || !tokenURI || selectedImageIndex === null}
              className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-sm disabled:opacity-50"
            >
              {loadingMint ? "Minting..." : "Mint Selected NFT"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
