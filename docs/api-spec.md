# API Spec

## GET /tier/:address

Returns the AI tier for a wallet.

- **Response:**
  - `address`: string
  - `tier`: number

## GET /hasTier/:address/:requiredTier

Checks if a wallet has at least the required tier.

- **Response:**
  - `ok`: boolean

## POST /tba/create

Creates or returns a token-bound account for an NFT.

- **Body:**
  - `tokenContract`: string
  - `tokenId`: string | number
  - `salt`: number

- **Response:**
  - `account`: string
