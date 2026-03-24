// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title AfterGlowNFT
/// @notice Simple ERC-721 contract for AI-generated NFTs.
contract AfterGlowNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdTracker;
    string private _baseTokenURI;

    event Minted(address indexed to, uint256 indexed tokenId, string tokenURI);

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseTokenURI_
    ) ERC721(name_, symbol_) {
        _baseTokenURI = baseTokenURI_;
    }

    /// @notice Set base URI for token metadata.
    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
    }

    /// @dev Override baseURI.
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /// @notice Mint a new token to `to` with a full tokenURI.
    /// @dev In production you might restrict this to a trusted orchestrator.
    function mintTo(address to, string calldata tokenURI_) external onlyOwner returns (uint256) {
        _tokenIdTracker += 1;
        uint256 newId = _tokenIdTracker;

        _safeMint(to, newId);
        _setTokenURI(newId, tokenURI_);

        emit Minted(to, newId, tokenURI_);
        return newId;
    }
}
