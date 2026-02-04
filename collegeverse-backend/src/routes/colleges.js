import { Router } from "express";
import { validate } from "../middleware/validate.js";
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
} from "../controllers/collegeController.js";

const router = Router();

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

// Submit a rating (verified seniors only)
router.post(
  "/:id/ratings",
  validate({ params: collegeIdParamSchema, body: submitRatingSchema }),
  submitCollegeRatingController
);

export default router;
