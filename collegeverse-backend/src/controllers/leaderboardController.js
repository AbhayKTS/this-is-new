import { fetchLeaderboard, upsertLeaderboard } from "../services/leaderboardService.js";
import { success, created } from "../utils/response.js";

export const listLeaderboardController = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 20;
    const data = await fetchLeaderboard({ page, pageSize });
    success(res, data, "leaderboard fetched");
  } catch (err) {
    next(err);
  }
};

export const upsertLeaderboardController = async (req, res, next) => {
  try {
    const data = await upsertLeaderboard(req.validatedBody);
    created(res, data, "leaderboard updated");
  } catch (err) {
    next(err);
  }
};
