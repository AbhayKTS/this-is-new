import {
  listMicrogigs,
  createMicrogig,
  applyToMicrogig,
  updateMicrogigStatus,
} from "../services/microgigService.js";
import { created, success } from "../utils/response.js";

export const listMicrogigsController = async (_req, res, next) => {
  try {
    const data = await listMicrogigs();
    success(res, data, "micro-gigs fetched");
  } catch (err) {
    next(err);
  }
};

export const createMicrogigController = async (req, res, next) => {
  try {
    const data = await createMicrogig(req.validatedBody);
    created(res, data, "micro-gig created");
  } catch (err) {
    next(err);
  }
};

export const applyMicrogigController = async (req, res, next) => {
  try {
    const { id } = req.validatedParams;
    const data = await applyToMicrogig(id, req.validatedBody);
    created(res, data, "application submitted");
  } catch (err) {
    next(err);
  }
};

export const updateMicrogigStatusController = async (req, res, next) => {
  try {
    const { id } = req.validatedParams;
    const { status } = req.validatedBody;
    const data = await updateMicrogigStatus(id, status);
    success(res, data, "micro-gig status updated");
  } catch (err) {
    next(err);
  }
};
