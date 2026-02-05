import { Router } from "express";
import { verifyToken, optionalAuth, requireAdmin } from "../middleware/auth.js";
import {
  getBadgeDefinitionsController,
  getUserBadgesController,
  getUserReputationController,
  getTopContributorsController,
  getMyBadgesController,
  awardBadgeController,
  initializeBadgesController,
} from "../controllers/badgeController.js";

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================

// Get all badge definitions
router.get("/definitions", getBadgeDefinitionsController);

// Get top contributors
router.get("/top-contributors", getTopContributorsController);

// Get user's badges (public profile)
router.get("/user/:userId", getUserBadgesController);

// Get user's reputation (public profile)
router.get("/user/:userId/reputation", getUserReputationController);

// ============================================
// AUTHENTICATED ROUTES
// ============================================

// Get current user's badges
router.get("/me", verifyToken, getMyBadgesController);

// ============================================
// ADMIN ROUTES
// ============================================

// Award a badge manually (admin only)
router.post("/award", verifyToken, requireAdmin, awardBadgeController);

// Initialize badge definitions in database (admin only - run once)
router.post("/initialize", verifyToken, requireAdmin, initializeBadgesController);

export default router;
