import { Router } from "express";
import usersRouter from "./users.js";
import profilesRouter from "./profiles.js";
import certificatesRouter from "./certificates.js";
import microgigsRouter from "./microgigs.js";
import leaderboardRouter from "./leaderboard.js";
import integrationsRouter from "./integrations.js";
// New feature routes
import verificationRouter from "./verification.js";
import communitiesRouter from "./communities.js";
import qaRouter from "./qa.js";
import badgesRouter from "./badges.js";
import collegesRouter from "./colleges.js";

const router = Router();

// Existing routes
router.use("/users", usersRouter);
router.use("/profiles", profilesRouter);
router.use("/certificates", certificatesRouter);
router.use("/micro-gigs", microgigsRouter);
router.use("/leaderboard", leaderboardRouter);
router.use("/integrations", integrationsRouter);

// New feature routes
router.use("/verification", verificationRouter);
router.use("/communities", communitiesRouter);
router.use("/qa", qaRouter);
router.use("/badges", badgesRouter);
router.use("/colleges", collegesRouter);

export default router;
