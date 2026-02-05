import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { verifyToken, requireAdmin, requireCollegeEmail } from "../middleware/auth.js";
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

// Submit verification request (requires college email + auth)
router.post(
  "/",
  verifyToken,
  requireCollegeEmail,
  validate({ body: submitVerificationSchema }),
  submitVerificationController
);

// Get verification status for current user
router.get("/status/me", verifyToken, async (req, res, next) => {
  try {
    req.params.userId = req.user.uid;
    getVerificationStatusController(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Get verification status for a user (admin)
router.get("/status/:userId", verifyToken, requireAdmin, getVerificationStatusController);

// Get verified seniors for a college (public)
router.get("/seniors", getVerifiedSeniorsController);

// Admin: List pending verifications
router.get("/pending", verifyToken, requireAdmin, listPendingVerificationsController);

// Admin: Approve or reject verification
router.patch(
  "/:id",
  verifyToken,
  requireAdmin,
  validate({ params: verificationIdParamSchema, body: updateVerificationSchema }),
  updateVerificationStatusController
);

export default router;
