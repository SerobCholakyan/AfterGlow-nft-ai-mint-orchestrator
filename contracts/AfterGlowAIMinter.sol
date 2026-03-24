// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/// @title AfterGlowAIMinter
/// @notice ERC-721 with RBAC, pausable, events, and optional fee withdrawal.
contract AfterGlowAIMinter is ERC721URIStorage, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 private _tokenIds;
    address payable public feeRecipient;
    uint256 public mintFee; // in wei

    event AfterGlowMinted(address indexed to, uint256 indexed tokenId, string tokenURI);
    event MintFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);

    constructor(address admin, address payable _feeRecipient, uint256 _mintFee)
        ERC721("AfterGlow AI Collection", "AGLOW")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);

        feeRecipient = _feeRecipient;
        mintFee = _mintFee;
    }

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not admin");
        _;
    }

    function setMintFee(uint256 _mintFee) external onlyAdmin {
        emit MintFeeUpdated(mintFee, _mintFee);
        mintFee = _mintFee;
    }

    function setFeeRecipient(address payable _feeRecipient) external onlyAdmin {
        emit FeeRecipientUpdated(feeRecipient, _feeRecipient);
        feeRecipient = _feeRecipient;
    }

    function pause() external onlyAdmin {
        _pause();
    }

    function unpause() external onlyAdmin {
        _unpause();
    }

    /// @notice Mint with optional fee. Only MINTER_ROLE can call.
    function mintTo(address recipient, string memory tokenURI)
        external
        payable
        whenNotPaused
        returns (uint256 newId)
    {
        require(hasRole(MINTER_ROLE, msg.sender), "Not minter");
        if (mintFee > 0) {
            require(msg.value >= mintFee, "Insufficient mint fee");
        }

        _tokenIds += 1;
        newId = _tokenIds;

        _safeMint(recipient, newId);
        _setTokenURI(newId, tokenURI);

        emit AfterGlowMinted(recipient, newId, tokenURI);
    }

    /// @notice Withdraw accumulated fees.
    function withdrawFees() external onlyAdmin {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        (bool ok, ) = feeRecipient.call{value: balance}("");
        require(ok, "Withdraw failed");
    }

    function totalMinted() external view returns (uint256) {
        return _tokenIds;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
