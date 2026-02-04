import { Router } from "express";
import { syncGitHubController } from "../controllers/integrationsController.js";
import { validateBody } from "../middleware/validate.js";
import { githubSyncSchema } from "../validators/integrationSchemas.js";

const router = Router();

router.post("/github/sync", validateBody(githubSyncSchema), syncGitHubController);

export default router;
