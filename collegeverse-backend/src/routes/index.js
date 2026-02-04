import { Router } from "express";
import usersRouter from "./users.js";
import profilesRouter from "./profiles.js";
import certificatesRouter from "./certificates.js";
import microgigsRouter from "./microgigs.js";
import leaderboardRouter from "./leaderboard.js";
import integrationsRouter from "./integrations.js";

const router = Router();

router.use("/users", usersRouter);
router.use("/profiles", profilesRouter);
router.use("/certificates", certificatesRouter);
router.use("/micro-gigs", microgigsRouter);
router.use("/leaderboard", leaderboardRouter);
router.use("/integrations", integrationsRouter);

export default router;
