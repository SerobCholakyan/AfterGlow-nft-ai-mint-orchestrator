import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { rateLimit } from "../../lib/rateLimit";

const AI_IMAGE_ENDPOINT = process.env.AI_IMAGE_ENDPOINT!;
const AI_API_KEY = process.env.AI_API_KEY!;
const NFT_STORAGE_API_KEY = process.env.NFT_STORAGE_API_KEY!;

type GenerateResponse = {
  tokenURI: string;
  imageCid: string;
  metadataCid: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateResponse | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!AI_IMAGE_ENDPOINT || !AI_API_KEY || !NFT_STORAGE_API_KEY) {
    return res.status(500).json({ error: "Server not configured (AI or NFT.Storage keys missing)" });
  }

  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
  const ok = rateLimit(`generate:${ip}`);
  if (!ok) {
    return res.status(429).json({ error: "Too many requests" });
  }

  try {
    const { prompt, name, description, attributes } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing or invalid prompt" });
    }

    // 1. AI image generation (OpenAI Images–style)
    const aiResp = await axios.post(
      AI_IMAGE_ENDPOINT,
      {
        prompt,
        n: 1,
        size: "1024x1024"
      },
      {
        headers: {
          Authorization: `Bearer ${AI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const imageBase64 = aiResp.data?.data?.[0]?.b64_json;
    if (!imageBase64) {
      throw new Error("AI endpoint did not return image data");
    }

    const imageBuffer = Buffer.from(imageBase64, "base64");

    // 2. Upload image to IPFS via NFT.Storage
    const imageUpload = await axios.post(
      "https://api.nft.storage/upload",
      imageBuffer,
      {
        headers: {
          Authorization: `Bearer ${NFT_STORAGE_API_KEY}`,
          "Content-Type": "application/octet-stream"
        }
      }
    );

    const imageCid = imageUpload.data.value.cid as string;
    const imageUrl = `ipfs://${imageCid}`;

    // 3. Metadata JSON
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

    return res.status(200).json({ tokenURI, imageCid, metadataCid });
  } catch (error: any) {
    console.error("Generation error:", error?.response?.data || error.message || error);
    return res.status(500).json({ error: "Generation failed" });
  }
}
