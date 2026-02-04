import { Router } from "express";
import {
  listMicrogigsController,
  createMicrogigController,
  applyMicrogigController,
  updateMicrogigStatusController,
} from "../controllers/microgigsController.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import {
  createMicrogigSchema,
  applyMicrogigSchema,
  updateMicrogigStatusSchema,
  microgigIdParamSchema,
} from "../validators/microgigSchemas.js";

const router = Router();

router.get("/", listMicrogigsController);
router.post("/", validateBody(createMicrogigSchema), createMicrogigController);
router.post(
  "/:id/apply",
  validateParams(microgigIdParamSchema),
  validateBody(applyMicrogigSchema),
  applyMicrogigController
);
router.patch(
  "/:id/status",
  validateParams(microgigIdParamSchema),
  validateBody(updateMicrogigStatusSchema),
  updateMicrogigStatusController
);

export default router;
