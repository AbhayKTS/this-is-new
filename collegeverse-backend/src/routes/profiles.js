import { Router } from "express";
import { upsertProfileController, getProfileController } from "../controllers/profilesController.js";
import { validateBody } from "../middleware/validate.js";
import { profileUpsertSchema } from "../validators/profileSchemas.js";

const router = Router();

router.get("/:userId", getProfileController);
router.post("/", validateBody(profileUpsertSchema), upsertProfileController);

export default router;
