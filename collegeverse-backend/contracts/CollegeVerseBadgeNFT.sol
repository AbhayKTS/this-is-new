// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CollegeVerse Achievement Badge NFT
 * @dev NFT badges for achievements on CollegeVerse platform
 * @notice These badges are transferable NFTs (unlike SBTs)
 */
contract CollegeVerseBadgeNFT is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable {
    // Token counter
    uint256 private _tokenIdCounter;
    
    // Badge type for each token
    mapping(uint256 => string) private _badgeTypes;
    
    // Track badges owned by each user (address => badgeType => tokenId)
    mapping(address => mapping(string => uint256)) private _userBadges;
    
    // Track if user has a specific badge type
    mapping(address => mapping(string => bool)) private _hasBadge;
    
    // Events
    event BadgeMinted(address indexed to, uint256 indexed tokenId, string badgeType);
    
    // Badge rarity levels
    enum Rarity { COMMON, UNCOMMON, RARE, EPIC, LEGENDARY }
    
    // Badge type info
    struct BadgeInfo {
        string name;
        string description;
        Rarity rarity;
        bool exists;
    }
    
    // Registered badge types
    mapping(string => BadgeInfo) public badgeTypes;
    
    constructor() ERC721("CollegeVerse Achievement Badge", "CVBADGE") Ownable(msg.sender) {
        // Register default badge types
        _registerBadgeType("first_review", "First Review", "Awarded for first college review", Rarity.COMMON);
        _registerBadgeType("helpful_reviewer", "Helpful Reviewer", "10+ upvotes on reviews", Rarity.UNCOMMON);
        _registerBadgeType("qa_champion", "Q&A Champion", "Answered 25+ questions", Rarity.RARE);
        _registerBadgeType("top_contributor", "Top Contributor", "Top 10 on leaderboard", Rarity.EPIC);
        _registerBadgeType("verified_senior", "Verified Senior", "Completed senior verification", Rarity.RARE);
        _registerBadgeType("community_leader", "Community Leader", "Leading a community", Rarity.EPIC);
        _registerBadgeType("mentor", "Mentor", "Mentored 10+ students", Rarity.LEGENDARY);
    }
    
    /**
     * @dev Register a new badge type (admin only)
     */
    function registerBadgeType(
        string memory badgeId,
        string memory name,
        string memory description,
        Rarity rarity
    ) external onlyOwner {
        _registerBadgeType(badgeId, name, description, rarity);
    }
    
    function _registerBadgeType(
        string memory badgeId,
        string memory name,
        string memory description,
        Rarity rarity
    ) internal {
        badgeTypes[badgeId] = BadgeInfo({
            name: name,
            description: description,
            rarity: rarity,
            exists: true
        });
    }
    
    /**
     * @dev Mint a badge NFT to a user
     * @param to The recipient address
     * @param badgeType The type of badge to mint
     * @param uri The token URI with badge metadata
     * @return tokenId The ID of the newly minted badge
     */
    function mintBadge(
        address to,
        string memory badgeType,
        string memory uri
    ) external onlyOwner returns (uint256) {
        require(badgeTypes[badgeType].exists, "Badge type does not exist");
        require(!_hasBadge[to][badgeType], "User already has this badge");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        _badgeTypes[tokenId] = badgeType;
        
        _userBadges[to][badgeType] = tokenId;
        _hasBadge[to][badgeType] = true;
        
        emit BadgeMinted(to, tokenId, badgeType);
        
        return tokenId;
    }
    
    /**
     * @dev Get the badge type for a token
     * @param tokenId The token ID
     * @return string The badge type
     */
    function getBadgeType(uint256 tokenId) external view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _badgeTypes[tokenId];
    }
    
    /**
     * @dev Get all token IDs owned by a user
     * @param user The user address
     * @return uint256[] Array of token IDs
     */
    function getUserBadges(address user) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory tokens = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            tokens[i] = tokenOfOwnerByIndex(user, i);
        }
        
        return tokens;
    }
    
    /**
     * @dev Check if user has a specific badge type
     * @param user The user address
     * @param badgeType The badge type to check
     * @return bool True if user has the badge
     */
    function hasBadge(address user, string memory badgeType) external view returns (bool) {
        return _hasBadge[user][badgeType];
    }
    
    /**
     * @dev Get total number of badges minted
     * @return uint256 Total supply
     */
    function totalSupply() public view override(ERC721Enumerable) returns (uint256) {
        return _tokenIdCounter;
    }
    
    // Required overrides for multiple inheritance
    function _update(address to, uint256 tokenId, address auth) 
        internal 
        override(ERC721, ERC721Enumerable) 
        returns (address) 
    {
        return super._update(to, tokenId, auth);
    }
    
    function _increaseBalance(address account, uint128 value) 
        internal 
        override(ERC721, ERC721Enumerable) 
    {
        super._increaseBalance(account, value);
    }
    
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721, ERC721URIStorage, ERC721Enumerable) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
}
