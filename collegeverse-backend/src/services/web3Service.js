/**
 * Web3 Service - Polygon Blockchain Integration
 * Handles SBTs, NFT badges, and blockchain interactions
 */

import { ethers } from "ethers";
import { env } from "../config/env.js";
import { db } from "../config/firebase.js";

// ==========================================
// BLOCKCHAIN SETUP
// ==========================================

// Provider and wallet setup
let provider = null;
let platformWallet = null;

const initializeWeb3 = () => {
  if (!env.web3Enabled) {
    console.log("Web3 features are disabled");
    return false;
  }

  try {
    provider = new ethers.JsonRpcProvider(env.polygonRpcUrl);
    
    if (env.platformWalletPrivateKey) {
      platformWallet = new ethers.Wallet(env.platformWalletPrivateKey, provider);
      console.log("Web3 initialized with platform wallet:", platformWallet.address);
    } else {
      console.warn("Platform wallet not configured - read-only mode");
    }
    
    return true;
  } catch (error) {
    console.error("Failed to initialize Web3:", error);
    return false;
  }
};

// Initialize on module load
initializeWeb3();

// Check if Web3 is available
export const isWeb3Available = () => {
  return {
    enabled: env.web3Enabled,
    connected: provider !== null,
    canMint: platformWallet !== null,
    network: {
      name: "Polygon Amoy Testnet",
      chainId: env.polygonChainId,
      rpcUrl: env.polygonRpcUrl
    }
  };
};

// ==========================================
// CONTRACT ABIs (Simplified for CollegeVerse)
// ==========================================

// SBT (Soulbound Token) ABI - ERC-5192 compliant
const SBT_ABI = [
  "function mint(address to, string memory tokenURI) external returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function locked(uint256 tokenId) external view returns (bool)",
  "function totalSupply() external view returns (uint256)",
  "event Minted(address indexed to, uint256 indexed tokenId, string tokenURI)",
  "event Locked(uint256 indexed tokenId)"
];

// NFT Badge ABI - ERC-721 with badge metadata
const BADGE_NFT_ABI = [
  "function mintBadge(address to, string memory badgeType, string memory tokenURI) external returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function getBadgeType(uint256 tokenId) external view returns (string memory)",
  "function getUserBadges(address user) external view returns (uint256[] memory)",
  "function totalSupply() external view returns (uint256)",
  "event BadgeMinted(address indexed to, uint256 indexed tokenId, string badgeType)"
];

// Get contract instances
const getSBTContract = () => {
  if (!env.sbtContractAddress) {
    throw new Error("SBT contract address not configured");
  }
  return new ethers.Contract(env.sbtContractAddress, SBT_ABI, platformWallet || provider);
};

const getBadgeNFTContract = () => {
  if (!env.badgeNftContractAddress) {
    throw new Error("Badge NFT contract address not configured");
  }
  return new ethers.Contract(env.badgeNftContractAddress, BADGE_NFT_ABI, platformWallet || provider);
};

// ==========================================
// SBT FUNCTIONS (Verified Seniors)
// ==========================================

/**
 * Mint SBT for a verified senior
 * @param {string} userId - Firebase user ID
 * @param {string} walletAddress - User's wallet address
 * @param {object} verificationData - Senior verification details
 */
export const mintSeniorSBT = async (userId, walletAddress, verificationData) => {
  if (!platformWallet) {
    throw new Error("Platform wallet not configured for minting");
  }

  // Validate wallet address
  if (!ethers.isAddress(walletAddress)) {
    throw new Error("Invalid wallet address");
  }

  // Check if user already has an SBT
  const existingSBT = await db.collection("web3_sbts").where("userId", "==", userId).get();
  if (!existingSBT.empty) {
    throw new Error("User already has a verified senior SBT");
  }

  // Create metadata for the SBT
  const metadata = {
    name: `CollegeVerse Verified Senior - ${verificationData.collegeName}`,
    description: `This Soulbound Token certifies that the holder is a verified senior student/alumni of ${verificationData.collegeName}. Verified on CollegeVerse platform.`,
    image: "ipfs://QmVerifiedSeniorBadgeImage", // Placeholder - would be actual IPFS hash
    attributes: [
      { trait_type: "College", value: verificationData.collegeName },
      { trait_type: "Graduation Year", value: verificationData.graduationYear },
      { trait_type: "Verification Date", value: new Date().toISOString().split("T")[0] },
      { trait_type: "Status", value: "Verified Senior" },
      { trait_type: "Platform", value: "CollegeVerse" }
    ],
    external_url: `https://collegeverse.app/verify/${userId}`,
    soulbound: true
  };

  // Upload metadata to IPFS
  const metadataUri = await uploadToIPFS(metadata, `sbt_${userId}.json`);

  try {
    const contract = getSBTContract();
    
    // Estimate gas
    const gasEstimate = await contract.mint.estimateGas(walletAddress, metadataUri);
    
    // Mint the SBT
    const tx = await contract.mint(walletAddress, metadataUri, {
      gasLimit: gasEstimate * 120n / 100n // 20% buffer
    });
    
    console.log("SBT mint transaction sent:", tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    // Get token ID from events
    const mintEvent = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === "Minted";
      } catch {
        return false;
      }
    });
    
    const tokenId = mintEvent ? 
      contract.interface.parseLog(mintEvent).args.tokenId.toString() : 
      null;

    // Store in database
    const sbtRecord = {
      userId,
      walletAddress: walletAddress.toLowerCase(),
      tokenId,
      transactionHash: tx.hash,
      metadataUri,
      metadata,
      contractAddress: env.sbtContractAddress,
      chainId: env.polygonChainId,
      mintedAt: new Date().toISOString(),
      status: "minted"
    };

    await db.collection("web3_sbts").add(sbtRecord);

    // Update user's verification status with Web3 info
    await db.collection("seniors_verification").doc(userId).update({
      sbtMinted: true,
      sbtTokenId: tokenId,
      sbtTransactionHash: tx.hash,
      walletAddress: walletAddress.toLowerCase()
    });

    return {
      success: true,
      tokenId,
      transactionHash: tx.hash,
      metadataUri,
      explorerUrl: `https://amoy.polygonscan.com/tx/${tx.hash}`
    };
  } catch (error) {
    console.error("SBT minting failed:", error);
    throw new Error(`Failed to mint SBT: ${error.message}`);
  }
};

/**
 * Verify if a wallet has a valid senior SBT
 */
export const verifySeniorSBT = async (walletAddress) => {
  if (!ethers.isAddress(walletAddress)) {
    throw new Error("Invalid wallet address");
  }

  try {
    const contract = getSBTContract();
    const balance = await contract.balanceOf(walletAddress);
    
    if (balance === 0n) {
      return { verified: false, message: "No SBT found for this wallet" };
    }

    // Get from our database for full details
    const sbtRecord = await db.collection("web3_sbts")
      .where("walletAddress", "==", walletAddress.toLowerCase())
      .limit(1)
      .get();

    if (sbtRecord.empty) {
      return { 
        verified: true, 
        onChain: true,
        message: "SBT found on chain but not in our records"
      };
    }

    const data = sbtRecord.docs[0].data();
    
    return {
      verified: true,
      tokenId: data.tokenId,
      metadata: data.metadata,
      mintedAt: data.mintedAt,
      userId: data.userId
    };
  } catch (error) {
    console.error("SBT verification error:", error);
    throw new Error(`Verification failed: ${error.message}`);
  }
};

// ==========================================
// NFT BADGE FUNCTIONS (Achievements)
// ==========================================

// Badge type definitions
export const BADGE_TYPES = {
  FIRST_REVIEW: {
    id: "first_review",
    name: "First Review",
    description: "Awarded for submitting your first college review",
    image: "ipfs://QmFirstReviewBadge",
    rarity: "common"
  },
  HELPFUL_REVIEWER: {
    id: "helpful_reviewer",
    name: "Helpful Reviewer",
    description: "Awarded for receiving 10+ upvotes on reviews",
    image: "ipfs://QmHelpfulReviewerBadge",
    rarity: "uncommon"
  },
  QA_CHAMPION: {
    id: "qa_champion",
    name: "Q&A Champion",
    description: "Awarded for answering 25+ questions",
    image: "ipfs://QmQAChampionBadge",
    rarity: "rare"
  },
  TOP_CONTRIBUTOR: {
    id: "top_contributor",
    name: "Top Contributor",
    description: "Awarded for being in the top 10 leaderboard",
    image: "ipfs://QmTopContributorBadge",
    rarity: "epic"
  },
  VERIFIED_SENIOR: {
    id: "verified_senior",
    name: "Verified Senior",
    description: "Awarded for completing senior verification",
    image: "ipfs://QmVerifiedSeniorBadge",
    rarity: "rare"
  },
  COMMUNITY_LEADER: {
    id: "community_leader",
    name: "Community Leader",
    description: "Awarded for leading a college community",
    image: "ipfs://QmCommunityLeaderBadge",
    rarity: "epic"
  },
  MENTOR: {
    id: "mentor",
    name: "Mentor",
    description: "Awarded for mentoring 10+ students",
    image: "ipfs://QmMentorBadge",
    rarity: "legendary"
  }
};

/**
 * Mint NFT badge for user achievement
 * @param {string} userId - Firebase user ID
 * @param {string} walletAddress - User's wallet address
 * @param {string} badgeType - Type of badge from BADGE_TYPES
 * @param {object} achievementData - Additional achievement details
 */
export const mintAchievementBadge = async (userId, walletAddress, badgeType, achievementData = {}) => {
  if (!platformWallet) {
    throw new Error("Platform wallet not configured for minting");
  }

  if (!ethers.isAddress(walletAddress)) {
    throw new Error("Invalid wallet address");
  }

  const badge = BADGE_TYPES[badgeType.toUpperCase()];
  if (!badge) {
    throw new Error(`Unknown badge type: ${badgeType}`);
  }

  // Check if user already has this badge
  const existingBadge = await db.collection("web3_badges")
    .where("userId", "==", userId)
    .where("badgeType", "==", badge.id)
    .get();
  
  if (!existingBadge.empty) {
    throw new Error(`User already has the ${badge.name} badge`);
  }

  // Create NFT metadata
  const metadata = {
    name: `CollegeVerse ${badge.name}`,
    description: badge.description,
    image: badge.image,
    attributes: [
      { trait_type: "Badge Type", value: badge.name },
      { trait_type: "Rarity", value: badge.rarity },
      { trait_type: "Earned Date", value: new Date().toISOString().split("T")[0] },
      { trait_type: "Platform", value: "CollegeVerse" },
      ...Object.entries(achievementData).map(([key, value]) => ({
        trait_type: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
        value: String(value)
      }))
    ],
    external_url: `https://collegeverse.app/badges/${badge.id}`,
    properties: {
      badge_id: badge.id,
      rarity: badge.rarity
    }
  };

  // Upload metadata to IPFS
  const metadataUri = await uploadToIPFS(metadata, `badge_${userId}_${badge.id}.json`);

  try {
    const contract = getBadgeNFTContract();
    
    // Estimate gas
    const gasEstimate = await contract.mintBadge.estimateGas(
      walletAddress, 
      badge.id, 
      metadataUri
    );
    
    // Mint the badge NFT
    const tx = await contract.mintBadge(walletAddress, badge.id, metadataUri, {
      gasLimit: gasEstimate * 120n / 100n
    });
    
    console.log("Badge mint transaction sent:", tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    // Get token ID from events
    const mintEvent = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === "BadgeMinted";
      } catch {
        return false;
      }
    });
    
    const tokenId = mintEvent ? 
      contract.interface.parseLog(mintEvent).args.tokenId.toString() : 
      null;

    // Store in database
    const badgeRecord = {
      userId,
      walletAddress: walletAddress.toLowerCase(),
      badgeType: badge.id,
      badgeName: badge.name,
      rarity: badge.rarity,
      tokenId,
      transactionHash: tx.hash,
      metadataUri,
      metadata,
      contractAddress: env.badgeNftContractAddress,
      chainId: env.polygonChainId,
      mintedAt: new Date().toISOString(),
      achievementData
    };

    await db.collection("web3_badges").add(badgeRecord);

    // Also add to regular badges collection for UI
    await db.collection("user_badges").add({
      userId,
      badgeId: badge.id,
      badgeName: badge.name,
      awardedAt: new Date().toISOString(),
      isNFT: true,
      nftTokenId: tokenId,
      nftTransactionHash: tx.hash
    });

    return {
      success: true,
      badge: badge.name,
      rarity: badge.rarity,
      tokenId,
      transactionHash: tx.hash,
      metadataUri,
      explorerUrl: `https://amoy.polygonscan.com/tx/${tx.hash}`
    };
  } catch (error) {
    console.error("Badge minting failed:", error);
    throw new Error(`Failed to mint badge: ${error.message}`);
  }
};

/**
 * Get all NFT badges for a user
 */
export const getUserNFTBadges = async (userId) => {
  const snapshot = await db.collection("web3_badges")
    .where("userId", "==", userId)
    .orderBy("mintedAt", "desc")
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * Get all NFT badges for a wallet address
 */
export const getWalletBadges = async (walletAddress) => {
  if (!ethers.isAddress(walletAddress)) {
    throw new Error("Invalid wallet address");
  }

  const snapshot = await db.collection("web3_badges")
    .where("walletAddress", "==", walletAddress.toLowerCase())
    .orderBy("mintedAt", "desc")
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// ==========================================
// IPFS FUNCTIONS (Pinata)
// ==========================================

/**
 * Upload data to IPFS via Pinata
 */
export const uploadToIPFS = async (data, filename = "data.json") => {
  if (!env.pinataApiKey || !env.pinataSecretKey) {
    // Return mock IPFS URI for development
    console.warn("Pinata not configured, using mock IPFS URI");
    const mockHash = "Qm" + Buffer.from(JSON.stringify(data)).toString("base64").substring(0, 44);
    return `ipfs://${mockHash}`;
  }

  try {
    const axios = (await import("axios")).default;
    
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        pinataContent: data,
        pinataMetadata: {
          name: filename
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "pinata_api_key": env.pinataApiKey,
          "pinata_secret_api_key": env.pinataSecretKey
        }
      }
    );

    const ipfsHash = response.data.IpfsHash;
    return `ipfs://${ipfsHash}`;
  } catch (error) {
    console.error("IPFS upload failed:", error);
    throw new Error(`Failed to upload to IPFS: ${error.message}`);
  }
};

/**
 * Upload file to IPFS via Pinata
 */
export const uploadFileToIPFS = async (fileBuffer, filename, mimeType) => {
  if (!env.pinataApiKey || !env.pinataSecretKey) {
    console.warn("Pinata not configured, using mock IPFS URI");
    const mockHash = "Qm" + Buffer.from(filename).toString("base64").substring(0, 44);
    return `ipfs://${mockHash}`;
  }

  try {
    const axios = (await import("axios")).default;
    const FormData = (await import("form-data")).default;
    
    const formData = new FormData();
    formData.append("file", fileBuffer, {
      filename,
      contentType: mimeType
    });
    
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          ...formData.getHeaders(),
          "pinata_api_key": env.pinataApiKey,
          "pinata_secret_api_key": env.pinataSecretKey
        }
      }
    );

    const ipfsHash = response.data.IpfsHash;
    return `ipfs://${ipfsHash}`;
  } catch (error) {
    console.error("IPFS file upload failed:", error);
    throw new Error(`Failed to upload file to IPFS: ${error.message}`);
  }
};

/**
 * Get IPFS content URL (for viewing)
 */
export const getIPFSUrl = (ipfsUri) => {
  if (!ipfsUri) return null;
  
  const hash = ipfsUri.replace("ipfs://", "");
  return `${env.pinataGateway}/${hash}`;
};

// ==========================================
// CERTIFICATE STORAGE
// ==========================================

/**
 * Store certificate on IPFS and create on-chain reference
 */
export const storeCertificateOnIPFS = async (certificateData, fileBuffer = null) => {
  const {
    userId,
    certificateType,
    title,
    issuer,
    issuedDate,
    description,
    recipientName
  } = certificateData;

  // Create certificate metadata
  const metadata = {
    name: title,
    description: description || `${certificateType} certificate issued by ${issuer}`,
    issuer,
    issuedDate,
    recipientName,
    certificateType,
    attributes: [
      { trait_type: "Certificate Type", value: certificateType },
      { trait_type: "Issuer", value: issuer },
      { trait_type: "Issue Date", value: issuedDate },
      { trait_type: "Platform", value: "CollegeVerse" }
    ],
    timestamp: new Date().toISOString()
  };

  // Upload certificate file if provided
  let fileIpfsUri = null;
  if (fileBuffer) {
    fileIpfsUri = await uploadFileToIPFS(
      fileBuffer, 
      `certificate_${userId}_${Date.now()}.pdf`,
      "application/pdf"
    );
    metadata.certificate_file = fileIpfsUri;
  }

  // Upload metadata to IPFS
  const metadataUri = await uploadToIPFS(metadata, `cert_metadata_${userId}_${Date.now()}.json`);

  // Store in database
  const certRecord = {
    userId,
    title,
    certificateType,
    issuer,
    issuedDate,
    metadataUri,
    fileUri: fileIpfsUri,
    metadata,
    storedAt: new Date().toISOString(),
    verified: false
  };

  const docRef = await db.collection("web3_certificates").add(certRecord);

  return {
    id: docRef.id,
    metadataUri,
    fileUri: fileIpfsUri,
    metadataUrl: getIPFSUrl(metadataUri),
    fileUrl: fileIpfsUri ? getIPFSUrl(fileIpfsUri) : null
  };
};

/**
 * Get user's certificates stored on IPFS
 */
export const getUserCertificates = async (userId) => {
  const snapshot = await db.collection("web3_certificates")
    .where("userId", "==", userId)
    .orderBy("storedAt", "desc")
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    metadataUrl: getIPFSUrl(doc.data().metadataUri),
    fileUrl: doc.data().fileUri ? getIPFSUrl(doc.data().fileUri) : null
  }));
};

/**
 * Verify certificate authenticity by IPFS hash
 */
export const verifyCertificate = async (metadataUri) => {
  const snapshot = await db.collection("web3_certificates")
    .where("metadataUri", "==", metadataUri)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return {
      verified: false,
      message: "Certificate not found in CollegeVerse records"
    };
  }

  const cert = snapshot.docs[0].data();
  
  return {
    verified: true,
    certificate: {
      title: cert.title,
      issuer: cert.issuer,
      issuedDate: cert.issuedDate,
      certificateType: cert.certificateType,
      storedAt: cert.storedAt
    }
  };
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Link wallet to user account
 */
export const linkWallet = async (userId, walletAddress, signature = null) => {
  if (!ethers.isAddress(walletAddress)) {
    throw new Error("Invalid wallet address");
  }

  // Check if wallet is already linked to another user
  const existingLink = await db.collection("web3_wallets")
    .where("walletAddress", "==", walletAddress.toLowerCase())
    .get();

  if (!existingLink.empty) {
    const existingUserId = existingLink.docs[0].data().userId;
    if (existingUserId !== userId) {
      throw new Error("This wallet is already linked to another account");
    }
    // Wallet already linked to this user
    return { success: true, alreadyLinked: true };
  }

  // Store wallet link
  await db.collection("web3_wallets").add({
    userId,
    walletAddress: walletAddress.toLowerCase(),
    linkedAt: new Date().toISOString(),
    isPrimary: true
  });

  // Update user profile
  await db.collection("students").doc(userId).update({
    walletAddress: walletAddress.toLowerCase(),
    walletLinkedAt: new Date().toISOString()
  });

  return { success: true, alreadyLinked: false };
};

/**
 * Get user's linked wallet
 */
export const getUserWallet = async (userId) => {
  const snapshot = await db.collection("web3_wallets")
    .where("userId", "==", userId)
    .where("isPrimary", "==", true)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data();
};

/**
 * Get Web3 status for a user
 */
export const getUserWeb3Status = async (userId) => {
  const [wallet, sbt, badges, certificates] = await Promise.all([
    getUserWallet(userId),
    db.collection("web3_sbts").where("userId", "==", userId).get(),
    db.collection("web3_badges").where("userId", "==", userId).get(),
    db.collection("web3_certificates").where("userId", "==", userId).get()
  ]);

  return {
    walletLinked: wallet !== null,
    walletAddress: wallet?.walletAddress || null,
    hasSBT: !sbt.empty,
    sbtTokenId: sbt.empty ? null : sbt.docs[0].data().tokenId,
    badgeCount: badges.size,
    certificateCount: certificates.size
  };
};

export default {
  isWeb3Available,
  mintSeniorSBT,
  verifySeniorSBT,
  mintAchievementBadge,
  getUserNFTBadges,
  getWalletBadges,
  BADGE_TYPES,
  uploadToIPFS,
  uploadFileToIPFS,
  getIPFSUrl,
  storeCertificateOnIPFS,
  getUserCertificates,
  verifyCertificate,
  linkWallet,
  getUserWallet,
  getUserWeb3Status
};
