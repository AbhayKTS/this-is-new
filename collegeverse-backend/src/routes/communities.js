import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { verifyToken, optionalAuth, requireCollegeEmail } from "../middleware/auth.js";
import {
  createCommunitySchema,
  communityIdParamSchema,
} from "../validators/communitySchemas.js";
import {
  createCommunityController,
  getCommunityController,
  listCommunitiesController,
  joinCommunityController,
  leaveCommunityController,
  getUserCommunitiesController,
  getCommunityMembersController,
  checkMembershipController,
  getMyCommunitiesController,
  createPostController,
  getCommunityPostsController,
} from "../controllers/communityController.js";

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================

// List all communities
router.get("/", listCommunitiesController);

// Get community by ID
router.get("/:id", getCommunityController);

// Get community members
router.get("/:id/members", getCommunityMembersController);

// Get community posts
router.get("/:id/posts", getCommunityPostsController);

// ============================================
// AUTHENTICATED ROUTES
// ============================================

// Get current user's communities
router.get("/my/list", verifyToken, getMyCommunitiesController);

// Get user's communities by userId
router.get("/user/:userId", getUserCommunitiesController);

// Create a new community (requires college email)
router.post(
  "/",
  verifyToken,
  requireCollegeEmail,
  validate({ body: createCommunitySchema }),
  createCommunityController
);

// Check if current user is member
router.get("/:id/membership", verifyToken, checkMembershipController);

// Join a community
router.post(
  "/:id/join",
  verifyToken,
  validate({ params: communityIdParamSchema }),
  joinCommunityController
);

// Leave a community
router.post(
  "/:id/leave",
  verifyToken,
  validate({ params: communityIdParamSchema }),
  leaveCommunityController
);

// Create a post in community
router.post(
  "/:id/posts",
  verifyToken,
  validate({ params: communityIdParamSchema }),
  createPostController
);

export default router;
