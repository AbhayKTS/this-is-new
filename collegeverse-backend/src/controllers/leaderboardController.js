import { fetchLeaderboard, fetchCollegeLeaderboard, getUserRank, upsertLeaderboard, recalculateLeaderboard } from "../services/leaderboardService.js";
import { success, created } from "../utils/response.js";

export const listLeaderboardController = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 20;
    const timeframe = req.query.timeframe || "all"; // all, monthly, weekly
    const data = await fetchLeaderboard({ page, pageSize, timeframe });
    success(res, data, "Leaderboard fetched");
  } catch (err) {
    next(err);
  }
};

export const getCollegeLeaderboardController = async (req, res, next) => {
  try {
    const { collegeId } = req.params;
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 20;
    const data = await fetchCollegeLeaderboard(collegeId, { page, pageSize });
    success(res, data, "College leaderboard fetched");
  } catch (err) {
    next(err);
  }
};

export const getUserRankController = async (req, res, next) => {
  try {
    const collegeId = req.query.collegeId || null;
    const data = await getUserRank(req.user.uid, collegeId);
    success(res, data, "User rank fetched");
  } catch (err) {
    next(err);
  }
};

export const upsertLeaderboardController = async (req, res, next) => {
  try {
    const data = await upsertLeaderboard(req.validatedBody);
    created(res, data, "Leaderboard updated");
  } catch (err) {
    next(err);
  }
};

export const recalculateLeaderboardController = async (req, res, next) => {
  try {
    const data = await recalculateLeaderboard();
    success(res, data, "Leaderboard recalculated");
  } catch (err) {
    next(err);
  }
};
