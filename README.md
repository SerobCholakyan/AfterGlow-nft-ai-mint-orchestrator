# AfterGlow – NFT AI Mint Orchestrator

AfterGlow is a public, composable protocol and reference implementation for:

- AI-generated NFTs (ERC-721)
- Token-gated AI access (ERC-20 / ERC-1155)
- Token-bound accounts (ERC-6551) as NFT “agent wallets”

## Features

- **AI-powered minting:** Off-chain AI generates media, on-chain contracts mint ERC-721 NFTs.
- **Token-gated AI tiers:** ERC-20 / ERC-1155 balances determine which AI tier a wallet can access.
- **ERC-6551 accounts:** Each NFT can have its own smart-contract wallet for credits, rewards, and state.

## ERC Standards

- **ERC-20:** Fungible tokens for AI access and credits.
- **ERC-721:** Core NFT standard for AI-generated assets.
- **ERC-1155:** Optional multi-token standard for passes, credits, and badges.
- **ERC-6551:** Token-bound accounts for NFT-native wallets.
- **ERC-165:** Interface detection for safe interoperability.
- **ERC-173:** Ownable pattern for public modules.
- **ERC-1822 / ERC-1967 (optional):** Upgradeable proxy patterns.

## Contracts

- `contracts/ai/PublicAITierOracle.sol`  
  Public on-chain oracle for AI access tiers based on ERC-20 / ERC-1155 balances.

- `contracts/erc6551/PublicNFTAccountModule.sol`  
  Registry-agnostic helper for creating and querying ERC-6551 token-bound accounts.

- `contracts/erc6551/interfaces/IERC6551Registry.sol`  
  Minimal interface for ERC-6551 registry.

- `contracts/nft/AfterGlowNFT.sol`  
  Example ERC-721 contract for AI-generated NFTs.

## High-Level Flow

1. User holds ERC-20 / ERC-1155 tokens.
2. Backend or contracts query `PublicAITierOracle` to determine AI tier.
3. Backend runs AI job (image, music, text, etc.).
4. NFT is minted via `AfterGlowNFT` (ERC-721).
5. `PublicNFTAccountModule` is used to create an ERC-6551 account for the NFT.
6. The NFT’s token-bound account can hold credits, rewards, or other assets.

## Deployment

Example Hardhat scripts are in `/scripts`:

- `deploy_tier_oracle.js`
- `deploy_6551_module.js`
- `deploy_nft.js`

### Quickstart (Hardhat)

```bash
npm install
npx hardhat compile

npx hardhat run scripts/deploy_tier_oracle.js --network <network>
npx hardhat run scripts/deploy_6551_module.js --network <network>
npx hardhat run scripts/deploy_nft.js --network <network>


Backend

Example backend services and routes are in /backend:

• backend/services/aiTierService.ts
• backend/services/tbaService.ts
• backend/routes/api.ts


These use ethers to talk to the deployed contracts and expose a simple HTTP API.

Docs

See /docs for:

• architecture.md – system diagram
• erc-standards.md – standards overview
• api-spec.md – HTTP API spec


License

MIT – fork, extend, and build your own AI × NFT experiences.
