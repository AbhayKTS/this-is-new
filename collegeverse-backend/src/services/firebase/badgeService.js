/**
 * Badge Service - Firebase Operations
 */

import { db, collections } from "../../config/firebase.js";
import studentService from "./studentService.js";

const badgesRef = db.collection(collections.BADGES);
const userBadgesRef = db.collection(collections.USER_BADGES);

export const badgeService = {
  /**
   * Get all badges
   */
  async getAll() {
    const snapshot = await badgesRef.where("isActive", "==", true).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  /**
   * Get badge by ID
   */
  async getById(id) {
    const doc = await badgesRef.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },
  
  /**
   * Get user's badges
   */
  async getUserBadges(userId) {
    const snapshot = await userBadgesRef
      .where("userId", "==", userId)
      .orderBy("awardedAt", "desc")
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  /**
   * Award badge to user
   */
  async awardBadge(userId, badgeId, awardedBy = null, reason = null) {
    // Check if user already has this badge
    const existing = await userBadgesRef
      .where("userId", "==", userId)
      .where("badgeId", "==", badgeId)
      .limit(1)
      .get();
    
    if (!existing.empty) {
      return { id: existing.docs[0].id, ...existing.docs[0].data() };
    }
    
    const badge = await this.getById(badgeId);
    if (!badge) throw new Error("Badge not found");
    
    const userBadgeData = {
      userId,
      badgeId,
      badgeName: badge.name,
      awardedAt: new Date(),
      awardedBy,
      awardReason: reason,
    };
    
    const docRef = await userBadgesRef.add(userBadgeData);
    
    // Award reputation bonus
    if (badge.reputationBonus) {
      await studentService.updateReputation(userId, badge.reputationBonus);
    }
    
    return { id: docRef.id, ...userBadgeData };
  },
  
  /**
   * Check and award automatic badges
   */
  async checkAutomaticBadges(userId) {
    const user = await studentService.getById(userId);
    if (!user) return [];
    
    const allBadges = await this.getAll();
    const awardedBadges = [];
    
    for (const badge of allBadges) {
      if (badge.type !== "automatic") continue;
      
      const requirements = badge.requirements || {};
      let eligible = true;
      
      // Check requirements
      if (requirements.requiresVerification && !user.isVerifiedSenior) {
        eligible = false;
      }
      if (requirements.minReputation && user.reputation < requirements.minReputation) {
        eligible = false;
      }
      if (requirements.minAnswers && user.answersGiven < requirements.minAnswers) {
        eligible = false;
      }
      if (requirements.minReviews && user.reviewsWritten < requirements.minReviews) {
        eligible = false;
      }
      if (requirements.minHelpfulVotes && user.helpfulVotes < requirements.minHelpfulVotes) {
        eligible = false;
      }
      
      if (eligible) {
        try {
          const awarded = await this.awardBadge(userId, badge.id, null, "Auto-awarded");
          awardedBadges.push(awarded);
        } catch (err) {
          // Badge already awarded, skip
        }
      }
    }
    
    return awardedBadges;
  },
  
  /**
   * Create a new badge (admin)
   */
  async create(data) {
    const slug = data.name.toLowerCase().replace(/\s+/g, "-");
    
    const badgeData = {
      id: slug,
      name: data.name,
      description: data.description,
      icon: data.icon || "🏆",
      color: data.color || "#FFD700",
      type: data.type || "manual",
      requirements: data.requirements || {},
      reputationBonus: data.reputationBonus || 0,
      isActive: true,
      createdAt: new Date(),
    };
    
    await badgesRef.doc(slug).set(badgeData);
    return badgeData;
  },
};

export default badgeService;

