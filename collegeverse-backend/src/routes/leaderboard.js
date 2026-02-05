import { Router } from "express";
import { verifyToken, optionalAuth, requireAdmin } from "../middleware/auth.js";
import { listLeaderboardController, upsertLeaderboardController, getCollegeLeaderboardController, getUserRankController, recalculateLeaderboardController } from "../controllers/leaderboardController.js";
import { validateBody } from "../middleware/validate.js";
import { upsertLeaderboardSchema } from "../validators/leaderboardSchemas.js";

const router = Router();

// Public - Get global leaderboard
router.get("/", listLeaderboardController);

// Public - Get college-specific leaderboard
router.get("/college/:collegeId", getCollegeLeaderboardController);

// Authenticated - Get current user's rank
router.get("/me", verifyToken, getUserRankController);

// Admin - Update leaderboard entry
router.post("/", verifyToken, requireAdmin, validateBody(upsertLeaderboardSchema), upsertLeaderboardController);

// Admin - Recalculate all scores
router.post("/recalculate", verifyToken, requireAdmin, recalculateLeaderboardController);

export default router;
