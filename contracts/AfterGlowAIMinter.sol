// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title AfterGlowAIMinter
/// @notice ERC-721 contract where the owner can mint tokens with arbitrary tokenURI.
/// @dev Designed to be used with an off-chain AI + IPFS orchestrator.
contract AfterGlowAIMinter is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    /// @notice Constructor sets the collection name, symbol, and initial owner.
    /// @param initialOwner The address that will be the contract owner.
    constructor(address initialOwner)
        ERC721("AfterGlow AI Collection", "AGLOW")
        Ownable(initialOwner)
    {}

    /// @notice Mint a new token to a recipient with a given tokenURI.
    /// @dev Only the owner (e.g., backend orchestrator wallet) can call this.
    /// @param recipient Address that will receive the NFT.
    /// @param tokenURI URI pointing to metadata JSON (e.g., ipfs://CID).
    /// @return newId The newly minted token ID.
    function mintTo(address recipient, string memory tokenURI)
        external
        onlyOwner
        returns (uint256 newId)
    {
        _tokenIds += 1;
        newId = _tokenIds;

        _safeMint(recipient, newId);
        _setTokenURI(newId, tokenURI);
    }

    /// @notice Get the current total minted supply.
    function totalMinted() external view returns (uint256) {
        return _tokenIds;
    }
}
