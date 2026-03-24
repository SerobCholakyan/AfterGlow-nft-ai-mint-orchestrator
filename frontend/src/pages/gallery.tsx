import { useEffect, useState } from "react";
import Link from "next/link";
import { getContract } from "../lib/web3";

type TokenInfo = {
  id: number;
  image: string;
  name: string;
  description: string;
};

export default function Gallery() {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { contract } = await getContract();
        const total = Number(await contract.totalMinted());

        const items: TokenInfo[] = [];
        for (let i = 1; i <= total; i++) {
          const tokenURI: string = await contract.tokenURI(i);
          const httpUri = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
          const resp = await fetch(httpUri);
          const meta = await resp.json();
          const image = (meta.image as string).replace("ipfs://", "https://ipfs.io/ipfs/");
          items.push({
            id: i,
            image,
            name: meta.name || `Token #${i}`,
            description: meta.description || ""
          });
        }

        setTokens(items);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center p-8 gap-6">
      <header className="w-full max-w-5xl flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">AfterGlow Gallery</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/">Mint</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </header>

      {loading && <p className="text-sm text-slate-300">Loading tokens...</p>}

      {!loading && tokens.length === 0 && (
        <p className="text-sm text-slate-300">No tokens minted yet.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {tokens.map((t) => (
          <div
            key={t.id}
            className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex flex-col gap-2"
          >
            <img
              src={t.image}
              alt={t.name}
              className="w-full h-64 object-cover rounded-md border border-slate-700"
            />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold">
                #{t.id} — {t.name}
              </span>
              <span className="text-xs text-slate-300">{t.description}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
