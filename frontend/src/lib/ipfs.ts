const GATEWAYS = [
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://nftstorage.link/ipfs/"
];

export async function fetchIpfsJson(cidOrUri: string) {
  const cid = cidOrUri.replace("ipfs://", "");
  for (const gw of GATEWAYS) {
    try {
      const resp = await fetch(gw + cid);
      if (resp.ok) return await resp.json();
    } catch {
      // try next gateway
    }
  }
  throw new Error("All IPFS gateways failed");
}

export function ipfsToHttp(cidOrUri: string): string {
  const cid = cidOrUri.replace("ipfs://", "");
  return `${GATEWAYS[0]}${cid}`;
}
