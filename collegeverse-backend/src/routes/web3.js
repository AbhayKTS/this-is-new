/**
 * Web3 Routes
 * Routes for blockchain/Web3 features
 */

import { Router } from "express";
import web3Controller from "../controllers/web3Controller.js";
import { optionalAuth, requireAuth, requireAdmin, requireVerifiedSenior } from "../middleware/auth.js";
import { rateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Rate limiting for Web3 operations (expensive on-chain ops)
const web3RateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10
});

const mintRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5 // 5 mints per hour
});

// ==========================================
// PUBLIC ROUTES
// ==========================================

/**
 * @route   GET /api/web3/status
 * @desc    Get Web3 service status
 * @access  Public
 */
router.get("/status", web3Controller.getStatus);

/**
 * @route   GET /api/web3/badges/types
 * @desc    Get all badge type definitions
 * @access  Public
 */
router.get("/badges/types", web3Controller.getBadgeTypes);

/**
 * @route   GET /api/web3/sbt/verify/:walletAddress
 * @desc    Verify if wallet has valid senior SBT
 * @access  Public
 */
router.get("/sbt/verify/:walletAddress", web3Controller.verifySBT);

/**
 * @route   GET /api/web3/badges/wallet/:walletAddress
 * @desc    Get all NFT badges for a wallet
 * @access  Public
 */
router.get("/badges/wallet/:walletAddress", web3Controller.getWalletBadges);

/**
 * @route   GET /api/web3/certificates/verify
 * @desc    Verify certificate by IPFS URI
 * @access  Public
 * @query   ipfsUri - The IPFS URI of the certificate metadata
 */
router.get("/certificates/verify", web3Controller.verifyCertificate);

// ==========================================
// AUTHENTICATED ROUTES
// ==========================================

/**
 * @route   POST /api/web3/wallet/link
 * @desc    Link wallet to user account
 * @access  Auth required
 * @body    { walletAddress: string, signature?: string }
 */
router.post(
  "/wallet/link",
  requireAuth,
  web3RateLimiter,
  web3Controller.linkWallet
);

/**
 * @route   GET /api/web3/wallet
 * @desc    Get user's linked wallet
 * @access  Auth required
 */
router.get("/wallet", requireAuth, web3Controller.getWallet);

/**
 * @route   GET /api/web3/user/status
 * @desc    Get user's complete Web3 status
 * @access  Auth required
 */
router.get("/user/status", requireAuth, web3Controller.getUserWeb3Status);

/**
 * @route   GET /api/web3/badges/user
 * @desc    Get current user's NFT badges
 * @access  Auth required
 */
router.get("/badges/user", requireAuth, web3Controller.getUserBadges);

/**
 * @route   GET /api/web3/certificates/user
 * @desc    Get current user's certificates
 * @access  Auth required
 */
router.get("/certificates/user", requireAuth, web3Controller.getUserCertificates);

// ==========================================
// MINTING ROUTES (Rate Limited)
// ==========================================

/**
 * @route   POST /api/web3/sbt/mint
 * @desc    Mint SBT for verified senior
 * @access  Verified Senior only
 * @body    { walletAddress: string }
 */
router.post(
  "/sbt/mint",
  requireAuth,
  requireVerifiedSenior,
  mintRateLimiter,
  web3Controller.mintSBT
);

/**
 * @route   POST /api/web3/badges/mint
 * @desc    Mint achievement badge NFT
 * @access  Auth required
 * @body    { walletAddress: string, badgeType: string, achievementData?: object }
 */
router.post(
  "/badges/mint",
  requireAuth,
  mintRateLimiter,
  web3Controller.mintBadge
);

/**
 * @route   POST /api/web3/certificates/store
 * @desc    Store certificate on IPFS
 * @access  Auth required
 * @body    { title, certificateType, issuer, issuedDate?, description?, recipientName? }
 */
router.post(
  "/certificates/store",
  requireAuth,
  web3RateLimiter,
  web3Controller.storeCertificate
);

// ==========================================
// ADMIN ROUTES
// ==========================================

/**
 * @route   POST /api/web3/admin/award-badge
 * @desc    Admin award badge to any user
 * @access  Admin only
 * @body    { userId, walletAddress, badgeType, achievementData? }
 */
router.post(
  "/admin/award-badge",
  requireAuth,
  requireAdmin,
  mintRateLimiter,
  web3Controller.adminAwardBadge
);

export default router;
