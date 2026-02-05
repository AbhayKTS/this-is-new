import { Router } from "express";
import usersRouter from "./users.js";
import profilesRouter from "./profiles.js";
import certificatesRouter from "./certificates.js";
import microgigsRouter from "./microgigs.js";
import leaderboardRouter from "./leaderboard.js";
import integrationsRouter from "./integrations.js";
// New feature routes
import authRouter from "./auth.js";
import verificationRouter from "./verification.js";
import communitiesRouter from "./communities.js";
import qaRouter from "./qa.js";
import badgesRouter from "./badges.js";
import collegesRouter from "./colleges.js";
// AI routes
import aiRouter from "./ai.js";

const router = Router();

// Auth routes (priority)
router.use("/auth", authRouter);

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

// AI-powered features
router.use("/ai", aiRouter);

export default router;
