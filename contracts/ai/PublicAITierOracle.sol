// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title PublicAITierOracle
/// @notice Public on-chain oracle for AI access tiers based on ERC-20 / ERC-1155 balances.
interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

interface IERC1155 {
    function balanceOf(address account, uint256 id) external view returns (uint256);
}

contract PublicAITierOracle {
    /// @notice Owner address for managing tier rules.
    address public owner;

    struct ERC20Rule {
        address token;
        uint256 minBalance;
    }

    struct ERC1155Rule {
        address token;
        uint256 id;
        uint256 minBalance;
    }

    /// @notice ERC-20 rules per tier.
    mapping(uint8 => ERC20Rule) public erc20Rules;
    /// @notice ERC-1155 rules per tier.
    mapping<uint8 => ERC1155Rule) public erc1155Rules;

    event TierRuleSet(uint8 indexed tier);
    event OwnerTransferred(address indexed oldOwner, address indexed newOwner);

    error NotOwner();
    error ZeroAddress();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    /// @param _owner Initial owner of the oracle.
    constructor(address _owner) {
        if (_owner == address(0)) revert ZeroAddress();
        owner = _owner;
    }

    /// @notice Transfer ownership of the oracle.
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        emit OwnerTransferred(owner, newOwner);
        owner = newOwner;
    }

    /// @notice Set an ERC-20 rule for a given tier.
    function setERC20Rule(
        uint8 tier,
        address token,
        uint256 minBalance
    ) external onlyOwner {
        erc20Rules[tier] = ERC20Rule({token: token, minBalance: minBalance});
        emit TierRuleSet(tier);
    }

    /// @notice Set an ERC-1155 rule for a given tier.
    function setERC1155Rule(
        uint8 tier,
        address token,
        uint256 id,
        uint256 minBalance
    ) external onlyOwner {
        erc1155Rules[tier] = ERC1155Rule({token: token, id: id, minBalance: minBalance});
        emit TierRuleSet(tier);
    }

    /// @notice Compute the best tier for a user based on configured rules.
    /// @dev Scans tiers 0..31; you can adjust this bound if needed.
    function tierOf(address user) public view returns (uint8) {
        uint8 bestTier;

        for (uint8 i = 0; i < 32; i++) {
            ERC20Rule memory r20 = erc20Rules[i];
            ERC1155Rule memory r1155 = erc1155Rules[i];

            bool ok20 = (r20.token != address(0) &&
                IERC20(r20.token).balanceOf(user) >= r20.minBalance);

            bool ok1155 = (r1155.token != address(0) &&
                IERC1155(r1155.token).balanceOf(user, r1155.id) >= r1155.minBalance);

            if (ok20 || ok1155) {
                bestTier = i;
            }
        }

        return bestTier;
    }

    /// @notice Check if a user has at least the required tier.
    function hasTier(address user, uint8 requiredTier) external view returns (bool) {
        return tierOf(user) >= requiredTier;
    }
}
