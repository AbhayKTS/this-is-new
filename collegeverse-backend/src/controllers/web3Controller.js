/**
 * Web3 Controller
 * Handles all Web3/blockchain related API endpoints
 */

import web3Service from "../services/web3Service.js";

/**
 * Get Web3 service status
 * GET /api/web3/status
 */
export const getStatus = async (req, res, next) => {
  try {
    const status = web3Service.isWeb3Available();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get badge type definitions
 * GET /api/web3/badges/types
 */
export const getBadgeTypes = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: web3Service.BADGE_TYPES
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// WALLET MANAGEMENT
// ==========================================

/**
 * Link wallet to user account
 * POST /api/web3/wallet/link
 */
export const linkWallet = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { walletAddress, signature } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required"
      });
    }

    const result = await web3Service.linkWallet(userId, walletAddress, signature);
    
    res.json({
      success: true,
      message: result.alreadyLinked ? "Wallet already linked" : "Wallet linked successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's linked wallet
 * GET /api/web3/wallet
 */
export const getWallet = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const wallet = await web3Service.getUserWallet(userId);
    
    res.json({
      success: true,
      data: wallet
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's Web3 status (wallet, SBT, badges, certs)
 * GET /api/web3/user/status
 */
export const getUserWeb3Status = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const status = await web3Service.getUserWeb3Status(userId);
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// SBT (SOULBOUND TOKENS)
// ==========================================

/**
 * Mint SBT for verified senior
 * POST /api/web3/sbt/mint
 */
export const mintSBT = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required"
      });
    }

    // Get user's verification data
    const { db } = await import("../config/firebase.js");
    const verificationDoc = await db.collection("seniors_verification").doc(userId).get();
    
    if (!verificationDoc.exists) {
      return res.status(400).json({
        success: false,
        message: "No verification record found"
      });
    }

    const verification = verificationDoc.data();
    
    if (verification.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Senior verification must be approved to mint SBT"
      });
    }

    if (verification.sbtMinted) {
      return res.status(400).json({
        success: false,
        message: "SBT already minted for this account"
      });
    }

    const result = await web3Service.mintSeniorSBT(userId, walletAddress, {
      collegeName: verification.collegeName,
      graduationYear: verification.graduationYear
    });

    res.json({
      success: true,
      message: "SBT minted successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify SBT by wallet address
 * GET /api/web3/sbt/verify/:walletAddress
 */
export const verifySBT = async (req, res, next) => {
  try {
    const { walletAddress } = req.params;
    const result = await web3Service.verifySeniorSBT(walletAddress);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// NFT BADGES
// ==========================================

/**
 * Mint achievement badge NFT
 * POST /api/web3/badges/mint
 */
export const mintBadge = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { walletAddress, badgeType, achievementData } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required"
      });
    }

    if (!badgeType) {
      return res.status(400).json({
        success: false,
        message: "Badge type is required"
      });
    }

    // Verify user is eligible for this badge
    const eligibility = await checkBadgeEligibility(userId, badgeType);
    if (!eligibility.eligible) {
      return res.status(400).json({
        success: false,
        message: eligibility.reason
      });
    }

    const result = await web3Service.mintAchievementBadge(
      userId, 
      walletAddress, 
      badgeType, 
      achievementData || {}
    );

    res.json({
      success: true,
      message: `${result.badge} badge minted successfully`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's NFT badges
 * GET /api/web3/badges/user
 */
export const getUserBadges = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const badges = await web3Service.getUserNFTBadges(userId);
    
    res.json({
      success: true,
      data: badges
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get badges by wallet address
 * GET /api/web3/badges/wallet/:walletAddress
 */
export const getWalletBadges = async (req, res, next) => {
  try {
    const { walletAddress } = req.params;
    const badges = await web3Service.getWalletBadges(walletAddress);
    
    res.json({
      success: true,
      data: badges
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CERTIFICATES (IPFS)
// ==========================================

/**
 * Store certificate on IPFS
 * POST /api/web3/certificates/store
 */
export const storeCertificate = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { title, certificateType, issuer, issuedDate, description, recipientName } = req.body;

    if (!title || !certificateType || !issuer) {
      return res.status(400).json({
        success: false,
        message: "Title, certificate type, and issuer are required"
      });
    }

    // Handle file upload if present
    let fileBuffer = null;
    if (req.file) {
      fileBuffer = req.file.buffer;
    }

    const result = await web3Service.storeCertificateOnIPFS({
      userId,
      title,
      certificateType,
      issuer,
      issuedDate: issuedDate || new Date().toISOString().split("T")[0],
      description,
      recipientName: recipientName || req.user.name
    }, fileBuffer);

    res.json({
      success: true,
      message: "Certificate stored on IPFS successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's certificates
 * GET /api/web3/certificates/user
 */
export const getUserCertificates = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const certificates = await web3Service.getUserCertificates(userId);
    
    res.json({
      success: true,
      data: certificates
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify certificate by IPFS hash
 * GET /api/web3/certificates/verify
 */
export const verifyCertificate = async (req, res, next) => {
  try {
    const { ipfsUri } = req.query;

    if (!ipfsUri) {
      return res.status(400).json({
        success: false,
        message: "IPFS URI is required"
      });
    }

    const result = await web3Service.verifyCertificate(ipfsUri);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN ROUTES
// ==========================================

/**
 * Admin: Award badge to user
 * POST /api/web3/admin/award-badge
 */
export const adminAwardBadge = async (req, res, next) => {
  try {
    const { userId, walletAddress, badgeType, achievementData } = req.body;

    if (!userId || !walletAddress || !badgeType) {
      return res.status(400).json({
        success: false,
        message: "User ID, wallet address, and badge type are required"
      });
    }

    const result = await web3Service.mintAchievementBadge(
      userId,
      walletAddress,
      badgeType,
      achievementData || {}
    );

    res.json({
      success: true,
      message: `Badge awarded to user`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Check if user is eligible for a badge
 */
async function checkBadgeEligibility(userId, badgeType) {
  const { db } = await import("../config/firebase.js");
  const type = badgeType.toUpperCase();

  switch (type) {
    case "FIRST_REVIEW": {
      const reviews = await db.collection("reviews")
        .where("userId", "==", userId)
        .limit(1)
        .get();
      return {
        eligible: !reviews.empty,
        reason: reviews.empty ? "Submit your first review to earn this badge" : null
      };
    }

    case "HELPFUL_REVIEWER": {
      const reviews = await db.collection("reviews")
        .where("userId", "==", userId)
        .get();
      const totalUpvotes = reviews.docs.reduce((sum, doc) => sum + (doc.data().upvotes || 0), 0);
      return {
        eligible: totalUpvotes >= 10,
        reason: totalUpvotes < 10 ? `Need ${10 - totalUpvotes} more upvotes on your reviews` : null
      };
    }

    case "QA_CHAMPION": {
      const answers = await db.collection("qa_answers")
        .where("userId", "==", userId)
        .get();
      return {
        eligible: answers.size >= 25,
        reason: answers.size < 25 ? `Answer ${25 - answers.size} more questions` : null
      };
    }

    case "VERIFIED_SENIOR": {
      const verification = await db.collection("seniors_verification").doc(userId).get();
      const isVerified = verification.exists && verification.data().status === "approved";
      return {
        eligible: isVerified,
        reason: isVerified ? null : "Complete senior verification to earn this badge"
      };
    }

    case "TOP_CONTRIBUTOR": {
      const leaderboard = await db.collection("leaderboard_scores")
        .orderBy("totalScore", "desc")
        .limit(10)
        .get();
      const isTopTen = leaderboard.docs.some(doc => doc.data().userId === userId);
      return {
        eligible: isTopTen,
        reason: isTopTen ? null : "Reach top 10 on the leaderboard"
      };
    }

    case "COMMUNITY_LEADER": {
      const communities = await db.collection("communities")
        .where("creatorId", "==", userId)
        .get();
      return {
        eligible: !communities.empty,
        reason: communities.empty ? "Create and lead a community" : null
      };
    }

    case "MENTOR": {
      // This would require a mentorship tracking system
      return {
        eligible: false,
        reason: "Mentor 10+ students to earn this badge"
      };
    }

    default:
      return {
        eligible: false,
        reason: "Unknown badge type"
      };
  }
}

export default {
  getStatus,
  getBadgeTypes,
  linkWallet,
  getWallet,
  getUserWeb3Status,
  mintSBT,
  verifySBT,
  mintBadge,
  getUserBadges,
  getWalletBadges,
  storeCertificate,
  getUserCertificates,
  verifyCertificate,
  adminAwardBadge
};
