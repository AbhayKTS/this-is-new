/**
 * Badge and Reputation Service - Firebase Implementation
 * Handles user badges, reputation scores, and achievements
 */

import { badgeService as firebaseBadgeService, studentService } from "./firebase/index.js";

// Badge definitions
export const BADGE_DEFINITIONS = {
  // Verification badges
  verified_senior: {
    name: "Verified Senior",
    description: "College ID verified student",
    icon: "shield-check",
    color: "#10B981",
    category: "verification",
    points: 50,
  },
  
  // Reputation badges
  helpful_contributor: {
    name: "Helpful Contributor",
    description: "Earned 100+ reputation points",
    icon: "heart",
    color: "#F59E0B",
    category: "reputation",
    points: 10,
  },
  trusted_guide: {
    name: "Trusted Guide",
    description: "Earned 500+ reputation points",
    icon: "star",
    color: "#8B5CF6",
    category: "reputation",
    points: 25,
  },
  community_champion: {
    name: "Community Champion",
    description: "Earned 1000+ reputation points",
    icon: "crown",
    color: "#EF4444",
    category: "reputation",
    points: 50,
  },
  
  // Activity badges
  first_question: {
    name: "Curious Mind",
    description: "Asked your first question",
    icon: "help-circle",
    color: "#06B6D4",
    category: "activity",
    points: 5,
  },
  first_answer: {
    name: "Helper",
    description: "Answered your first question",
    icon: "message-circle",
    color: "#14B8A6",
    category: "activity",
    points: 5,
  },
  ten_answers: {
    name: "Knowledge Sharer",
    description: "Answered 10 questions",
    icon: "book-open",
    color: "#6366F1",
    category: "activity",
    points: 15,
  },
  fifty_answers: {
    name: "Mentor",
    description: "Answered 50 questions",
    icon: "award",
    color: "#EC4899",
    category: "activity",
    points: 30,
  },
  accepted_answer: {
    name: "Problem Solver",
    description: "Had an answer accepted",
    icon: "check-circle",
    color: "#22C55E",
    category: "activity",
    points: 10,
  },
  
  // Community badges
  community_founder: {
    name: "Community Founder",
    description: "Created a college community",
    icon: "users",
    color: "#3B82F6",
    category: "community",
    points: 20,
  },
  active_member: {
    name: "Active Member",
    description: "Active in 3+ communities",
    icon: "zap",
    color: "#F97316",
    category: "community",
    points: 15,
  },
  
  // Review badges
  first_review: {
    name: "Reviewer",
    description: "Wrote your first college review",
    icon: "edit",
    color: "#A855F7",
    category: "review",
    points: 10,
  },
  thorough_reviewer: {
    name: "Thorough Reviewer",
    description: "Wrote 5+ detailed reviews",
    icon: "file-text",
    color: "#0EA5E9",
    category: "review",
    points: 25,
  },
};

// Get all badge definitions
export const getBadgeDefinitions = () => {
  return Object.entries(BADGE_DEFINITIONS).map(([id, badge]) => ({
    id,
    ...badge,
  }));
};

// Get user's badges
export const getUserBadges = async (userId) => {
  const userBadges = await firebaseBadgeService.getUserBadges(userId);
  
  return userBadges.map((badge) => ({
    ...BADGE_DEFINITIONS[badge.badgeId],
    id: badge.badgeId,
    awarded_at: badge.awardedAt,
  }));
};

// Award a badge to user
export const awardBadge = async (userId, badgeType, metadata = {}) => {
  if (!BADGE_DEFINITIONS[badgeType]) {
    throw new Error(`Unknown badge type: ${badgeType}`);
  }
  
  const awarded = await firebaseBadgeService.awardBadge(userId, badgeType, metadata);
  
  // Award bonus reputation for earning badge
  const badgePoints = BADGE_DEFINITIONS[badgeType].points || 0;
  if (badgePoints > 0) {
    await studentService.updateReputation(userId, badgePoints);
  }
  
  return { 
    ...BADGE_DEFINITIONS[badgeType], 
    id: badgeType, 
    awarded_at: awarded.awardedAt,
    pointsAwarded: badgePoints,
  };
};

// Check if user has badge
export const hasBadge = async (userId, badgeType) => {
  return await firebaseBadgeService.hasBadge(userId, badgeType);
};

// Get user's reputation
export const getUserReputation = async (userId) => {
  const user = await studentService.getById(userId);
  return user?.reputation || 0;
};

// Get top users by reputation
export const getTopContributors = async ({ page = 1, pageSize = 20, collegeId = null }) => {
  const limit = pageSize;
  const contributors = await studentService.getTopContributors(limit * page, collegeId);
  
  const from = (page - 1) * pageSize;
  const paginatedData = contributors.slice(from, from + pageSize);
  
  return { 
    data: paginatedData, 
    total: contributors.length, 
    page, 
    pageSize,
  };
};

// Check and award activity badges
export const checkActivityBadges = async (userId) => {
  const user = await studentService.getById(userId);
  
  if (!user) return [];
  
  const badgesToAward = [];
  
  // Check question badges
  if (user.questionsAsked >= 1) {
    if (!(await hasBadge(userId, "first_question"))) {
      badgesToAward.push("first_question");
    }
  }
  
  // Check answer badges
  if (user.answersGiven >= 1) {
    if (!(await hasBadge(userId, "first_answer"))) {
      badgesToAward.push("first_answer");
    }
  }
  if (user.answersGiven >= 10) {
    if (!(await hasBadge(userId, "ten_answers"))) {
      badgesToAward.push("ten_answers");
    }
  }
  if (user.answersGiven >= 50) {
    if (!(await hasBadge(userId, "fifty_answers"))) {
      badgesToAward.push("fifty_answers");
    }
  }
  
  // Check review badges
  if (user.reviewsWritten >= 1) {
    if (!(await hasBadge(userId, "first_review"))) {
      badgesToAward.push("first_review");
    }
  }
  if (user.reviewsWritten >= 5) {
    if (!(await hasBadge(userId, "thorough_reviewer"))) {
      badgesToAward.push("thorough_reviewer");
    }
  }
  
  // Check reputation badges
  if (user.reputation >= 100) {
    if (!(await hasBadge(userId, "helpful_contributor"))) {
      badgesToAward.push("helpful_contributor");
    }
  }
  if (user.reputation >= 500) {
    if (!(await hasBadge(userId, "trusted_guide"))) {
      badgesToAward.push("trusted_guide");
    }
  }
  if (user.reputation >= 1000) {
    if (!(await hasBadge(userId, "community_champion"))) {
      badgesToAward.push("community_champion");
    }
  }
  
  // Award all earned badges
  for (const badge of badgesToAward) {
    try {
      await awardBadge(userId, badge, { autoAwarded: true });
    } catch (e) {
      // Badge might already exist
    }
  }
  
  return badgesToAward;
};

// Initialize default badges in database
export const initializeBadges = async () => {
  for (const [id, badge] of Object.entries(BADGE_DEFINITIONS)) {
    await firebaseBadgeService.createBadge(id, {
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      color: badge.color,
      category: badge.category,
      points: badge.points,
    });
  }
  return { success: true, count: Object.keys(BADGE_DEFINITIONS).length };
};
