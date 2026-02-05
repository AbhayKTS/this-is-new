// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CollegeVerse Senior SBT (Soulbound Token)
 * @dev ERC-5192 compliant Soulbound Token for verified seniors
 * @notice This token is non-transferable once minted (soulbound)
 */
contract CollegeVerseSeniorSBT is ERC721, ERC721URIStorage, Ownable {
    // Token counter
    uint256 private _tokenIdCounter;
    
    // Mapping to track locked (soulbound) tokens
    mapping(uint256 => bool) private _locked;
    
    // Mapping to prevent duplicate SBTs per address
    mapping(address => bool) private _hasSBT;
    
    // Events as per ERC-5192
    event Locked(uint256 indexed tokenId);
    event Minted(address indexed to, uint256 indexed tokenId, string tokenURI);
    
    constructor() ERC721("CollegeVerse Verified Senior", "CVSBT") Ownable(msg.sender) {}
    
    /**
     * @dev Mint a new SBT to a verified senior
     * @param to The address of the verified senior
     * @param uri The token URI containing verification metadata
     * @return tokenId The ID of the newly minted token
     */
    function mint(address to, string memory uri) external onlyOwner returns (uint256) {
        require(!_hasSBT[to], "Address already has an SBT");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        // Lock the token immediately (soulbound)
        _locked[tokenId] = true;
        _hasSBT[to] = true;
        
        emit Minted(to, tokenId, uri);
        emit Locked(tokenId);
        
        return tokenId;
    }
    
    /**
     * @dev Check if a token is locked (soulbound)
     * @param tokenId The token ID to check
     * @return bool True if the token is locked
     */
    function locked(uint256 tokenId) external view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _locked[tokenId];
    }
    
    /**
     * @dev Check if an address has an SBT
     * @param account The address to check
     * @return bool True if the address has an SBT
     */
    function hasSBT(address account) external view returns (bool) {
        return _hasSBT[account];
    }
    
    /**
     * @dev Get total number of SBTs minted
     * @return uint256 Total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    // Override transfer functions to prevent transfers (soulbound)
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0)) but prevent transfers
        if (from != address(0) && to != address(0)) {
            revert("SBT: Token is soulbound and cannot be transferred");
        }
        
        return super._update(to, tokenId, auth);
    }
    
    // Required overrides
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        // ERC-5192 interface ID
        return interfaceId == 0xb45a3c0e || super.supportsInterface(interfaceId);
    }
}
