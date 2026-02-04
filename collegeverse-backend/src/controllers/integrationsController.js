import { fetchGitHubActivityScore } from "../services/githubService.js";
import { upsertLeaderboard } from "../services/leaderboardService.js";
import { success } from "../utils/response.js";

export const syncGitHubController = async (req, res, next) => {
  try {
    const { user_id, github_username } = req.validatedBody;
    const { score, eventsCount } = await fetchGitHubActivityScore(github_username);
    const leaderboardRow = await upsertLeaderboard({ user_id, score });
    success(res, { score, eventsCount, leaderboard: leaderboardRow }, "GitHub activity synced");
  } catch (err) {
    next(err);
  }
};
