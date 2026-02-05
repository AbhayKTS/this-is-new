/**
 * Leaderboard Service - Firebase Implementation
 */

import { leaderboardService as firebaseLeaderboardService, studentService } from "./firebase/index.js";

// Get global leaderboard
export const fetchLeaderboard = async ({ page = 1, pageSize = 20, collegeId = null, timeframe = "all" }) => {
  const result = await firebaseLeaderboardService.getGlobalLeaderboard({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    collegeId,
    timeframe,
  });
  
  return {
    data: result.data,
    total: result.total,
    page,
    pageSize,
    totalPages: Math.ceil(result.total / pageSize),
  };
};

// Get college-specific leaderboard
export const fetchCollegeLeaderboard = async (collegeId, { page = 1, pageSize = 20 }) => {
  return await fetchLeaderboard({ page, pageSize, collegeId });
};

// Get user's rank
export const getUserRank = async (userId, collegeId = null) => {
  return await firebaseLeaderboardService.getUserRank(userId, collegeId);
};

// Update user score (called when reputation changes)
export const upsertLeaderboard = async ({ user_id, score }) => {
  await firebaseLeaderboardService.updateScore(user_id, score);
  return { user_id, score };
};

// Recalculate leaderboard (admin function)
export const recalculateLeaderboard = async () => {
  // Get all students with reputation
  const students = await studentService.getTopContributors(1000);
  
  for (const student of students) {
    await firebaseLeaderboardService.updateScore(student.uid, student.reputation || 0);
  }
  
  return { success: true, updated: students.length };
};

// Get top contributors (quick access)
export const getTopContributors = async (limit = 10, collegeId = null) => {
  return await studentService.getTopContributors(limit, collegeId);
};
