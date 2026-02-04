import {
  submitVerification,
  getVerificationStatus,
  listPendingVerifications,
  updateVerificationStatus,
  getVerifiedSeniors,
} from "../services/verificationService.js";
import { success, created } from "../utils/response.js";

export const submitVerificationController = async (req, res, next) => {
  try {
    const data = await submitVerification(req.validatedBody);
    created(res, data, "Verification request submitted");
  } catch (err) {
    next(err);
  }
};

export const getVerificationStatusController = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const data = await getVerificationStatus(userId);
    success(res, data, "Verification status fetched");
  } catch (err) {
    next(err);
  }
};

export const listPendingVerificationsController = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const data = await listPendingVerifications({
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
    });
    success(res, data, "Pending verifications fetched");
  } catch (err) {
    next(err);
  }
};

export const updateVerificationStatusController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reviewer_notes } = req.validatedBody;
    const data = await updateVerificationStatus(id, status, reviewer_notes);
    success(res, data, `Verification ${status}`);
  } catch (err) {
    next(err);
  }
};

export const getVerifiedSeniorsController = async (req, res, next) => {
  try {
    const { collegeName } = req.query;
    const data = await getVerifiedSeniors(collegeName);
    success(res, data, "Verified seniors fetched");
  } catch (err) {
    next(err);
  }
};
