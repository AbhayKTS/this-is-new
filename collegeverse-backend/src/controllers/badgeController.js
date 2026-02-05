import {
  getBadgeDefinitions,
  getUserBadges,
  getUserReputation,
  getTopContributors,
  awardBadge,
  initializeBadges,
} from "../services/badgeService.js";
import { success, created } from "../utils/response.js";

export const getBadgeDefinitionsController = async (req, res, next) => {
  try {
    const data = getBadgeDefinitions();
    success(res, data, "Badge definitions fetched");
  } catch (err) {
    next(err);
  }
};

export const getUserBadgesController = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const data = await getUserBadges(userId);
    success(res, data, "User badges fetched");
  } catch (err) {
    next(err);
  }
};

export const getMyBadgesController = async (req, res, next) => {
  try {
    const data = await getUserBadges(req.user.uid);
    success(res, data, "Your badges fetched");
  } catch (err) {
    next(err);
  }
};

export const getUserReputationController = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const data = await getUserReputation(userId);
    success(res, { reputation_score: data }, "User reputation fetched");
  } catch (err) {
    next(err);
  }
};

export const getTopContributorsController = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, collegeId } = req.query;
    const data = await getTopContributors({
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
      collegeId,
    });
    success(res, data, "Top contributors fetched");
  } catch (err) {
    next(err);
  }
};

export const awardBadgeController = async (req, res, next) => {
  try {
    const { userId, badgeType, metadata } = req.body;
    
    if (!userId || !badgeType) {
      return res.status(400).json({
        success: false,
        message: "userId and badgeType are required",
      });
    }
    
    const data = await awardBadge(userId, badgeType, metadata || {});
    created(res, data, "Badge awarded successfully");
  } catch (err) {
    next(err);
  }
};

export const initializeBadgesController = async (req, res, next) => {
  try {
    const data = await initializeBadges();
    success(res, data, "Badges initialized successfully");
  } catch (err) {
    next(err);
  }
};
