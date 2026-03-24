import { useState } from "react";
import Link from "next/link";
import { connectWallet, getContract } from "../lib/web3";

export default function Admin() {
  const [account, setAccount] = useState<string | null>(null);
  const [recipient, setRecipient] = useState("");
  const [tokenURI, setTokenURI] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleConnect() {
    try {
      const addr = await connectWallet();
      setAccount(addr);
    } catch (e: any) {
      alert(e?.message || "Failed to connect wallet");
    }
  }

  async function handleMint() {
    if (!recipient || !tokenURI) {
      alert("Recipient and tokenURI are required");
      return;
    }

    setLoading(true);
    try {
      const { contract } = await getContract();
      const tx = await contract.mintTo(recipient, tokenURI);
      await tx.wait();
      alert("Admin mint successful");
    } catch (e: any) {
      alert(e?.message || "Admin mint failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-8 gap-6">
      <header className="w-full max-w-5xl flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">AfterGlow Admin</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/">Mint</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </header>

      <p className="text-sm text-slate-300 max-w-xl text-center">
        Admin dashboard for direct minting using an existing tokenURI. Only the contract owner can mint.
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
          Recipient address
          <input
            className="w-full mt-1 px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
          />
        </label>

        <label className="text-sm">
          tokenURI (ipfs://...)
          <input
            className="w-full mt-1 px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm"
            value={tokenURI}
            onChange={(e) => setTokenURI(e.target.value)}
            placeholder="ipfs://..."
          />
        </label>

        <button
          onClick={handleMint}
          disabled={loading}
          className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-sm disabled:opacity-50"
        >
          {loading ? "Minting..." : "Admin Mint"}
        </button>
      </div>
    </main>
  );
}
