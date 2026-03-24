import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { rateLimit } from "../../lib/rateLimit";

const AI_IMAGE_ENDPOINT = process.env.AI_IMAGE_ENDPOINT!;
const AI_API_KEY = process.env.AI_API_KEY!;
const NFT_STORAGE_API_KEY = process.env.NFT_STORAGE_API_KEY!;
const API_KEY = process.env.AFTERGLOW_API_KEY!;

type GenerateResponse = {
  tokenURI: string;
  imageCids: string[];
  metadataCid: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateResponse | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!AI_IMAGE_ENDPOINT || !AI_API_KEY || !NFT_STORAGE_API_KEY || !API_KEY) {
    return res.status(500).json({ error: "Server not configured (AI or NFT.Storage keys missing)" });
  }

  const headerKey = req.headers["x-afterglow-key"];
  if (!headerKey || headerKey !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
  const ok = rateLimit(`generate:${ip}`);
  if (!ok) {
    return res.status(429).json({ error: "Too many requests" });
  }

  try {
    const { prompt, name, description, attributes, negativePrompt, count } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing or invalid prompt" });
    }

    const n = Math.min(Math.max(Number(count) || 1, 1), 4);

    const aiResp = await axios.post(
      AI_IMAGE_ENDPOINT,
      {
        prompt,
        n,
        size: "1024x1024",
        negative_prompt: negativePrompt || undefined
      },
      {
        headers: {
          Authorization: `Bearer ${AI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const imagesBase64: string[] = aiResp.data?.data?.map((d: any) => d.b64_json) || [];
    if (!imagesBase64.length) {
      throw new Error("AI endpoint did not return image data");
    }

    const imageCids: string[] = [];
    for (const b64 of imagesBase64) {
      const buf = Buffer.from(b64, "base64");
      const upload = await axios.post(
        "https://api.nft.storage/upload",
        buf,
        {
          headers: {
            Authorization: `Bearer ${NFT_STORAGE_API_KEY}`,
            "Content-Type": "application/octet-stream"
          }
        }
      );
      imageCids.push(upload.data.value.cid as string);
    }

    const imageUrl = `ipfs://${imageCids[0]}`;

    const metadata = {
      name: typeof name === "string" && name.trim() ? name : "AfterGlow AI NFT",
      description:
        typeof description === "string" && description.trim()
          ? description
          : `AI-generated NFT: ${prompt}`,
      image: imageUrl,
      attributes: Array.isArray(attributes) ? attributes : []
    };

    const metadataUpload = await axios.post(
      "https://api.nft.storage/upload",
      JSON.stringify(metadata),
      {
        headers: {
          Authorization: `Bearer ${NFT_STORAGE_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const metadataCid = metadataUpload.data.value.cid as string;
    const tokenURI = `ipfs://${metadataCid}`;

    return res.status(200).json({ tokenURI, imageCids, metadataCid });
  } catch (error: any) {
    console.error("Generation error:", error?.response?.data || error.message || error);
    return res.status(500).json({ error: "Generation failed" });
  }
}
