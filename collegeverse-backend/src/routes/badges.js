import { Router } from "express";
import {
  getBadgeDefinitionsController,
  getUserBadgesController,
  getReputationHistoryController,
  getUserReputationController,
  getTopContributorsController,
} from "../controllers/badgeController.js";

const router = Router();

// Get all badge definitions
router.get("/definitions", getBadgeDefinitionsController);

// Get top contributors
router.get("/top-contributors", getTopContributorsController);

// Get user's badges
router.get("/user/:userId", getUserBadgesController);

// Get user's reputation
router.get("/user/:userId/reputation", getUserReputationController);

// Get user's reputation history
router.get("/user/:userId/history", getReputationHistoryController);

export default router;
