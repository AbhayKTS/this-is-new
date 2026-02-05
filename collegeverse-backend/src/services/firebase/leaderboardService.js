/**
 * Leaderboard Service - Firebase Operations
 */

import { db, collections } from "../../config/firebase.js";
import studentService from "./studentService.js";

const leaderboardRef = db.collection(collections.LEADERBOARD_SCORES);

export const leaderboardService = {
  /**
   * Update leaderboard entry for a user
   */
  async updateUserScore(userId) {
    const user = await studentService.getById(userId);
    if (!user) throw new Error("User not found");
    
    // Get user badges count
    const badges = await db.collection(collections.USER_BADGES)
      .where("userId", "==", userId)
      .get();
    
    const scoreData = {
      userId,
      userName: user.name,
      userAvatar: user.avatar,
      collegeId: user.collegeId,
      collegeName: user.collegeName,
      
      totalReputation: user.reputation || 0,
      weeklyReputation: 0,  // TODO: Implement weekly tracking
      monthlyReputation: 0, // TODO: Implement monthly tracking
      
      answersCount: user.answersGiven || 0,
      acceptedAnswersCount: 0, // TODO: Track this
      reviewsCount: user.reviewsWritten || 0,
      helpfulVotes: user.helpfulVotes || 0,
      
      badgesCount: badges.size,
      topBadge: null, // TODO: Determine top badge
      
      updatedAt: new Date(),
    };
    
    await leaderboardRef.doc(userId).set(scoreData, { merge: true });
    return scoreData;
  },
  
  /**
   * Get global leaderboard
   */
  async getGlobalLeaderboard(limit = 50) {
    const snapshot = await leaderboardRef
      .orderBy("totalReputation", "desc")
      .limit(limit)
      .get();
    
    return snapshot.docs.map((doc, index) => ({
      rank: index + 1,
      id: doc.id,
      ...doc.data(),
    }));
  },
  
  /**
   * Get college leaderboard
   */
  async getCollegeLeaderboard(collegeId, limit = 50) {
    const snapshot = await leaderboardRef
      .where("collegeId", "==", collegeId)
      .orderBy("totalReputation", "desc")
      .limit(limit)
      .get();
    
    return snapshot.docs.map((doc, index) => ({
      rank: index + 1,
      id: doc.id,
      ...doc.data(),
    }));
  },
  
  /**
   * Get user's rank
   */
  async getUserRank(userId) {
    const user = await leaderboardRef.doc(userId).get();
    if (!user.exists) return null;
    
    const userData = user.data();
    
    // Get global rank
    const higherRanked = await leaderboardRef
      .where("totalReputation", ">", userData.totalReputation)
      .get();
    
    const globalRank = higherRanked.size + 1;
    
    // Get college rank
    let collegeRank = null;
    if (userData.collegeId) {
      const collegeHigherRanked = await leaderboardRef
        .where("collegeId", "==", userData.collegeId)
        .where("totalReputation", ">", userData.totalReputation)
        .get();
      collegeRank = collegeHigherRanked.size + 1;
    }
    
    return {
      globalRank,
      collegeRank,
      ...userData,
    };
  },
  
  /**
   * Get top performers by category
   */
  async getTopByCategory(category, limit = 10) {
    const field = {
      answers: "answersCount",
      reviews: "reviewsCount",
      helpful: "helpfulVotes",
      badges: "badgesCount",
    }[category] || "totalReputation";
    
    const snapshot = await leaderboardRef
      .orderBy(field, "desc")
      .limit(limit)
      .get();
    
    return snapshot.docs.map((doc, index) => ({
      rank: index + 1,
      id: doc.id,
      ...doc.data(),
    }));
  },
};

export default leaderboardService;

