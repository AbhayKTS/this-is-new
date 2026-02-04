import { Router } from "express";
import { validate } from "../middleware/validate.js";
import {
  submitVerificationSchema,
  updateVerificationSchema,
  verificationIdParamSchema,
} from "../validators/verificationSchemas.js";
import {
  submitVerificationController,
  getVerificationStatusController,
  listPendingVerificationsController,
  updateVerificationStatusController,
  getVerifiedSeniorsController,
} from "../controllers/verificationController.js";

const router = Router();

// Submit verification request
router.post(
  "/",
  validate({ body: submitVerificationSchema }),
  submitVerificationController
);

// Get verification status for a user
router.get("/status/:userId", getVerificationStatusController);

// Get verified seniors for a college
router.get("/seniors", getVerifiedSeniorsController);

// Admin: List pending verifications
router.get("/pending", listPendingVerificationsController);

// Admin: Approve or reject verification
router.patch(
  "/:id",
  validate({ params: verificationIdParamSchema, body: updateVerificationSchema }),
  updateVerificationStatusController
);

export default router;
