import { Router } from "express";
import {
  createCertificateController,
  verifyCertificateController,
  listCertificatesController,
} from "../controllers/certificatesController.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import {
  certificateIdParamSchema,
  createCertificateSchema,
  verifyCertificateSchema,
} from "../validators/certificateSchemas.js";

const router = Router();

router.get("/", listCertificatesController);
router.post("/", validateBody(createCertificateSchema), createCertificateController);
router.patch(
  "/:id",
  validateParams(certificateIdParamSchema),
  validateBody(verifyCertificateSchema),
  verifyCertificateController
);

export default router;
