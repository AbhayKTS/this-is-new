import { Router } from "express";
import { listLeaderboardController, upsertLeaderboardController } from "../controllers/leaderboardController.js";
import { validateBody } from "../middleware/validate.js";
import { upsertLeaderboardSchema } from "../validators/leaderboardSchemas.js";

const router = Router();

router.get("/", listLeaderboardController);
router.post("/", validateBody(upsertLeaderboardSchema), upsertLeaderboardController);

export default router;
