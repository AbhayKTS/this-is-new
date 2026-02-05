import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { verifyToken, requireAdmin, requireVerifiedSenior } from "../middleware/auth.js";
import { moderate } from "../middleware/contentModeration.js";
import {
  collegeIdParamSchema,
  submitRatingSchema,
  searchCollegeSchema,
  compareCollegesSchema,
} from "../validators/collegeSchemas.js";
import {
  getCollegeController,
  listCollegesController,
  getCollegeRatingsController,
  submitCollegeRatingController,
  compareCollegesController,
  getTrendingCollegesController,
  searchCollegesController,
  createCollegeController,
  updateCollegeController,
  deleteCollegeController,
  getCollegeStatsController,
} from "../controllers/collegeController.js";

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================

// List all colleges
router.get("/", listCollegesController);

// Search colleges
router.get(
  "/search",
  validate({ query: searchCollegeSchema }),
  searchCollegesController
);

// Get trending colleges
router.get("/trending", getTrendingCollegesController);

// Compare colleges
router.get(
  "/compare",
  validate({ query: compareCollegesSchema }),
  compareCollegesController
);

// Get college by ID
router.get(
  "/:id",
  validate({ params: collegeIdParamSchema }),
  getCollegeController
);

// Get college ratings
router.get(
  "/:id/ratings",
  validate({ params: collegeIdParamSchema }),
  getCollegeRatingsController
);

// ============================================
// AUTHENTICATED ROUTES
// ============================================

// Submit a rating (verified seniors only + content moderation)
router.post(
  "/:id/ratings",
  verifyToken,
  requireVerifiedSenior,
  validate({ params: collegeIdParamSchema, body: submitRatingSchema }),
  moderate(["title", "content", "pros", "cons"], { contentType: "review", blockSevere: true }),
  submitCollegeRatingController
);

// ============================================
// ADMIN ROUTES
// ============================================

// Create a new college (Admin only)
router.post(
  "/",
  verifyToken,
  requireAdmin,
  createCollegeController
);

// Get college statistics (Admin only)
router.get(
  "/:id/stats",
  verifyToken,
  requireAdmin,
  validate({ params: collegeIdParamSchema }),
  getCollegeStatsController
);

// Update a college (Admin only)
router.put(
  "/:id",
  verifyToken,
  requireAdmin,
  validate({ params: collegeIdParamSchema }),
  updateCollegeController
);

// Delete a college (Admin only)
router.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  validate({ params: collegeIdParamSchema }),
  deleteCollegeController
);

export default router;
