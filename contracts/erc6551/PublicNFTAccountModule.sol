// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC6551Registry.sol";

/// @title PublicNFTAccountModule
/// @notice Helper for creating and querying ERC-6551 token-bound accounts.
contract PublicNFTAccountModule {
    IERC6551Registry public immutable registry;
    uint256 public immutable chainId;

    event AccountCreated(
        address indexed tokenContract,
        uint256 indexed tokenId,
        address account,
        uint256 salt
    );

    /// @param _registry Address of the ERC-6551 registry.
    /// @param _chainId Chain ID used for account derivation.
    constructor(address _registry, uint256 _chainId) {
        registry = IERC6551Registry(_registry);
        chainId = _chainId;
    }

    /// @notice Get or create a token-bound account for an NFT.
    function getOrCreateAccount(
        address implementation,
        address tokenContract,
        uint256 tokenId,
        uint256 salt,
        bytes calldata initData
    ) external returns (address) {
        address acc = registry.account(
            implementation,
            chainId,
            tokenContract,
            tokenId,
            salt
        );

        if (acc == address(0)) {
            acc = registry.createAccount(
                implementation,
                chainId,
                tokenContract,
                tokenId,
                salt,
                initData
            );
            emit AccountCreated(tokenContract, tokenId, acc, salt);
        }

        return acc;
    }

    /// @notice View the token-bound account for an NFT (if it exists).
    function accountOf(
        address implementation,
        address tokenContract,
        uint256 tokenId,
        uint256 salt
    ) external view returns (address) {
        return registry.account(
            implementation,
            chainId,
            tokenContract,
            tokenId,
            salt
        );
    }
}
