import { useEffect, useState } from "react";
import Link from "next/link";
import { getContract } from "../lib/web3";
import { fetchIpfsJson, ipfsToHttp } from "../lib/ipfs";

type TokenInfo = {
  id: number;
  image: string;
  name: string;
  description: string;
};

const PAGE_SIZE = 20;

export default function Gallery() {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { contract } = await getContract();
        const totalMinted = Number(await contract.totalMinted());
        setTotal(totalMinted);

        const start = (page - 1) * PAGE_SIZE + 1;
        const end = Math.min(totalMinted, page * PAGE_SIZE);

        const items: TokenInfo[] = [];
        for (let i = start; i <= end; i++) {
          try {
            const tokenURI: string = await contract.tokenURI(i);
            const meta = await fetchIpfsJson(tokenURI);
            const image = ipfsToHttp(meta.image as string);
            items.push({
              id: i,
              image,
              name: meta.name || `Token #${i}`,
              description: meta.description || ""
            });
          } catch (e) {
            console.error("Failed to load token", i, e);
          }
        }

        setTokens((prev) => [...prev, ...items]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [page]);

  const hasMore = total === 0 ? false : tokens.length < total;

  return (
    <main className="min-h-screen flex flex-col items-center p-4 sm:p-8 gap-6">
      <header className="w-full max-w-5xl flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">AfterGlow Gallery</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/">Mint</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </header>

      {loading && tokens.length === 0 && (
        <p className="text-sm text-slate-300">Loading tokens...</p>
      )}

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
              <div className="flex gap-2 mt-1">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `Check out my AfterGlow NFT #${t.id}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-400"
                >
                  Share on X
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={loading}
          className="mt-4 px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-sm disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load more"}
        </button>
      )}
    </main>
  );
}
