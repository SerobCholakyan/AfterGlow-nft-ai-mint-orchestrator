// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IERC6551Registry
/// @notice Minimal interface for ERC-6551 registry.
interface IERC6551Registry {
    function createAccount(
        address implementation,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId,
        uint256 salt,
        bytes calldata initData
    ) external returns (address);

    function account(
        address implementation,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId,
        uint256 salt
    ) external view returns (address);
}
