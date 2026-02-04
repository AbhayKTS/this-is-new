import { upsertProfile, getProfile } from "../services/profileService.js";
import { success, created } from "../utils/response.js";

export const upsertProfileController = async (req, res, next) => {
  try {
    const data = await upsertProfile(req.validatedBody);
    created(res, data, "profile saved");
  } catch (err) {
    next(err);
  }
};

export const getProfileController = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const data = await getProfile(userId);
    success(res, data, "profile fetched");
  } catch (err) {
    next(err);
  }
};
