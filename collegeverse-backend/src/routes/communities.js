import { Router } from "express";
import { validate } from "../middleware/validate.js";
import {
  createCommunitySchema,
  joinLeaveCommunitySchema,
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
} from "../controllers/communityController.js";

const router = Router();

// List all communities
router.get("/", listCommunitiesController);

// Get user's communities
router.get("/user/:userId", getUserCommunitiesController);

// Create a new community
router.post(
  "/",
  validate({ body: createCommunitySchema }),
  createCommunityController
);

// Get community by ID
router.get("/:id", getCommunityController);

// Get community members
router.get("/:id/members", getCommunityMembersController);

// Check if user is member
router.get("/:id/membership", checkMembershipController);

// Join a community
router.post(
  "/:id/join",
  validate({ params: communityIdParamSchema, body: joinLeaveCommunitySchema }),
  joinCommunityController
);

// Leave a community
router.post(
  "/:id/leave",
  validate({ params: communityIdParamSchema, body: joinLeaveCommunitySchema }),
  leaveCommunityController
);

export default router;
