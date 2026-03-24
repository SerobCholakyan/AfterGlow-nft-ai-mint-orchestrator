# AfterGlow-nft-ai-mint-orchestrator

AfterGlow is a public, reusable template for:

- Generating NFT images via an AI endpoint (OpenAI Images–style)
- Storing images + metadata on IPFS via NFT.Storage
- Minting ERC-721 NFTs on Polygon or Ethereum
- Viewing them on marketplaces like OpenSea once indexed
- Browsing a gallery of minted NFTs
- Using an admin dashboard for minting
- Rate-limited API to avoid abuse

This repository **does not** include any private keys, wallets, or secrets.  
You bring your own `.env` values and AI/IPFS providers.

## Tech stack

- **Smart contract:** ERC-721 with tokenURI storage (OpenZeppelin)
- **Chains:** Polygon mainnet (137) and Ethereum mainnet (1)
- **Frontend:** Next.js + React + Tailwind CSS
- **Wallet:** MetaMask + ethers.js
- **Storage:** IPFS via NFT.Storage
- **AI:** OpenAI Images–style endpoint (you configure URL + key)
- **Extras:** Gallery, Admin dashboard, API rate limiting, dark UI

---

## Getting started

### 1. Install dependencies

```bash
# At repo root
npm install

# Frontend
cd frontend
npm install


2. Configure environment variables

Copy the example files and fill them with your own values:

# At repo root
cp .env.example .env

cd frontend
cp .env.local.example .env.local


Edit .env and frontend/.env.local:

• Set PRIVATE_KEY to your deployer wallet private key (never commit this).
• Set POLYGON_RPC_URL and ETHEREUM_RPC_URL to your RPC provider URLs.
• Set CONTRACT_OWNER_ADDRESS to your EOA.
• After deployment, set NEXT_PUBLIC_CONTRACT_ADDRESS to the deployed contract address.
• Set AI_IMAGE_ENDPOINT, AI_API_KEY, and NFT_STORAGE_API_KEY in frontend/.env.local.


3. Compile and deploy the contract

# At repo root
npx hardhat compile

# Deploy to Polygon mainnet
npx hardhat run scripts/deploy.ts --network polygon

# OR deploy to Ethereum mainnet
npx hardhat run scripts/deploy.ts --network ethereum


Copy the printed contract address into:

• .env as NEXT_PUBLIC_CONTRACT_ADDRESS
• frontend/.env.local as NEXT_PUBLIC_CONTRACT_ADDRESS


4. Run the frontend

cd frontend
npm run dev


Open http://localhost:3000 in your browser.

---

How it works

1. User connects MetaMask.
2. User enters a text prompt and optional name/description.
3. Frontend calls /api/generate with the prompt.
4. API route:• Calls your AI endpoint to generate an image (OpenAI Images–style).
• Uploads the image to IPFS via NFT.Storage.
• Builds metadata JSON and uploads it to IPFS.
• Returns tokenURI (ipfs://CID) and image CID.

5. Frontend shows a preview and a “Mint” button.
6. On mint:• Frontend calls mintTo(recipient, tokenURI) on the contract via MetaMask.
• Once mined, the NFT is live on-chain and will appear on marketplaces after indexing.

7. Gallery page reads totalMinted() and tokenURIs to show minted NFTs.
8. Admin page provides a focused minting interface (same contract).


---

Security notes

• Never commit .env or .env.local.
• Use a dedicated deployer wallet with limited funds.
• Start on a testnet (by adjusting config) before mainnet.
• You can rotate NFT_STORAGE_API_KEY and AI keys at any time.


---

License

MIT – feel free to fork, modify, and share.
