import {
  getBadgeDefinitions,
  getUserBadges,
  getReputationHistory,
  getUserReputation,
  getTopContributors,
} from "../services/badgeService.js";
import { success } from "../utils/response.js";

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

export const getReputationHistoryController = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, pageSize = 50 } = req.query;
    const data = await getReputationHistory(userId, {
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
    });
    success(res, data, "Reputation history fetched");
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
