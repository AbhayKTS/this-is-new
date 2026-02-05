# CollegeVerse Smart Contracts

## Overview

This directory contains the Solidity smart contracts for CollegeVerse's Web3 features:

1. **CollegeVerseSeniorSBT.sol** - Soulbound Token (SBT) for verified seniors
2. **CollegeVerseBadgeNFT.sol** - NFT badges for achievements

## Contracts

### CollegeVerseSeniorSBT (ERC-5192)

A Soulbound Token implementation that certifies verified senior students/alumni.

**Features:**
- Non-transferable (soulbound) after minting
- One SBT per wallet address
- Metadata stored on IPFS
- ERC-5192 compliant

**Functions:**
- `mint(address to, string uri)` - Mint SBT to verified senior (owner only)
- `locked(uint256 tokenId)` - Check if token is soulbound
- `hasSBT(address account)` - Check if address has an SBT
- `tokenURI(uint256 tokenId)` - Get token metadata URI

### CollegeVerseBadgeNFT (ERC-721)

Standard NFT badges for various achievements on the platform.

**Features:**
- Transferable NFTs
- Multiple badge types with rarity levels
- One badge per type per user
- Enumerable for easy listing

**Badge Types:**
| Badge ID | Name | Rarity | Requirement |
|----------|------|--------|-------------|
| first_review | First Review | Common | Submit first review |
| helpful_reviewer | Helpful Reviewer | Uncommon | 10+ upvotes on reviews |
| qa_champion | Q&A Champion | Rare | Answer 25+ questions |
| top_contributor | Top Contributor | Epic | Top 10 leaderboard |
| verified_senior | Verified Senior | Rare | Complete verification |
| community_leader | Community Leader | Epic | Lead a community |
| mentor | Mentor | Legendary | Mentor 10+ students |

## Deployment

### Prerequisites

1. Install Hardhat or Foundry
2. Configure network in `hardhat.config.js`
3. Set environment variables:
   ```
   POLYGON_RPC_URL=https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY
   PRIVATE_KEY=your_deployer_private_key
   POLYGONSCAN_API_KEY=your_api_key
   ```

### Deploy to Polygon Amoy Testnet

```bash
# Using Hardhat
npx hardhat run scripts/deploy.js --network amoy

# Or using Foundry
forge create --rpc-url $POLYGON_RPC_URL \
  --private-key $PRIVATE_KEY \
  src/CollegeVerseSeniorSBT.sol:CollegeVerseSeniorSBT
```

### Verify Contracts

```bash
npx hardhat verify --network amoy <CONTRACT_ADDRESS>
```

## Gas Estimates (Polygon)

| Operation | Estimated Gas | Cost (@ 30 gwei) |
|-----------|---------------|------------------|
| Deploy SBT | ~1,500,000 | ~0.045 MATIC |
| Deploy Badge NFT | ~2,500,000 | ~0.075 MATIC |
| Mint SBT | ~150,000 | ~0.0045 MATIC |
| Mint Badge | ~180,000 | ~0.0054 MATIC |

## Integration

After deployment, update the backend `.env`:

```env
SBT_CONTRACT_ADDRESS=0x...
BADGE_NFT_CONTRACT_ADDRESS=0x...
PLATFORM_WALLET_PRIVATE_KEY=0x...
```

## Security Considerations

1. **Owner Key Security**: The platform wallet private key must be stored securely
2. **Rate Limiting**: Minting is rate-limited in the backend
3. **Verification**: SBT minting requires prior senior verification
4. **Non-transferable**: SBTs cannot be transferred or sold

## Testing

```bash
# Run tests
npx hardhat test

# Gas report
npx hardhat test --gas-reporter
```

## License

MIT License
