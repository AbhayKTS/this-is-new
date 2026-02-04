import { supabase } from "../lib/supabaseClient.js";

/**
 * Badge and Reputation Service
 * Handles user badges, reputation scores, and achievements
 */

// Badge definitions
export const BADGE_DEFINITIONS = {
  // Verification badges
  verified_senior: {
    name: "Verified Senior",
    description: "College ID verified student",
    icon: "shield-check",
    color: "#10B981",
    category: "verification",
  },
  
  // Reputation badges
  helpful_contributor: {
    name: "Helpful Contributor",
    description: "Earned 100+ reputation points",
    icon: "heart",
    color: "#F59E0B",
    category: "reputation",
  },
  trusted_guide: {
    name: "Trusted Guide",
    description: "Earned 500+ reputation points",
    icon: "star",
    color: "#8B5CF6",
    category: "reputation",
  },
  community_champion: {
    name: "Community Champion",
    description: "Earned 1000+ reputation points",
    icon: "crown",
    color: "#EF4444",
    category: "reputation",
  },
  
  // Activity badges
  first_question: {
    name: "Curious Mind",
    description: "Asked your first question",
    icon: "help-circle",
    color: "#06B6D4",
    category: "activity",
  },
  first_answer: {
    name: "Helper",
    description: "Answered your first question",
    icon: "message-circle",
    color: "#14B8A6",
    category: "activity",
  },
  ten_answers: {
    name: "Knowledge Sharer",
    description: "Answered 10 questions",
    icon: "book-open",
    color: "#6366F1",
    category: "activity",
  },
  fifty_answers: {
    name: "Mentor",
    description: "Answered 50 questions",
    icon: "award",
    color: "#EC4899",
    category: "activity",
  },
  accepted_answer: {
    name: "Problem Solver",
    description: "Had an answer accepted",
    icon: "check-circle",
    color: "#22C55E",
    category: "activity",
  },
  
  // Community badges
  community_founder: {
    name: "Community Founder",
    description: "Created a college community",
    icon: "users",
    color: "#3B82F6",
    category: "community",
  },
  active_member: {
    name: "Active Member",
    description: "Active in 3+ communities",
    icon: "zap",
    color: "#F97316",
    category: "community",
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
  const { data, error } = await supabase
    .from("user_badges")
    .select("badge_type, awarded_at")
    .eq("user_id", userId)
    .order("awarded_at", { ascending: false });
  
  if (error) throw error;
  
  return data.map((badge) => ({
    ...BADGE_DEFINITIONS[badge.badge_type],
    id: badge.badge_type,
    awarded_at: badge.awarded_at,
  }));
};

// Award a badge to user
export const awardBadge = async (userId, badgeType) => {
  if (!BADGE_DEFINITIONS[badgeType]) {
    throw new Error(`Unknown badge type: ${badgeType}`);
  }
  
  const { data, error } = await supabase
    .from("user_badges")
    .upsert({
      user_id: userId,
      badge_type: badgeType,
      awarded_at: new Date().toISOString(),
    }, { onConflict: "user_id,badge_type" })
    .select()
    .single();
  
  if (error) throw error;
  return { ...BADGE_DEFINITIONS[badgeType], id: badgeType, awarded_at: data.awarded_at };
};

// Get user's reputation history
export const getReputationHistory = async (userId, { page = 1, pageSize = 50 }) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  const { data, error, count } = await supabase
    .from("reputation_history")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);
  
  if (error) throw error;
  return { data, total: count || 0, page, pageSize };
};

// Get user's total reputation
export const getUserReputation = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .select("reputation_score")
    .eq("id", userId)
    .single();
  
  if (error) throw error;
  return data?.reputation_score || 0;
};

// Get top users by reputation
export const getTopContributors = async ({ page = 1, pageSize = 20, collegeId = null }) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  let query = supabase
    .from("users")
    .select("id, name, email, reputation_score, is_verified_senior, verified_college", { count: "exact" })
    .gt("reputation_score", 0);
  
  if (collegeId) {
    query = query.eq("college_id", collegeId);
  }
  
  const { data, error, count } = await query
    .order("reputation_score", { ascending: false })
    .range(from, to);
  
  if (error) throw error;
  return { data, total: count || 0, page, pageSize };
};

// Check and award activity badges
export const checkActivityBadges = async (userId) => {
  // Get user stats
  const [questionsResult, answersResult, acceptedResult, communitiesResult] = await Promise.all([
    supabase.from("questions").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("answers").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("answers").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("is_accepted", true),
    supabase.from("community_members").select("id", { count: "exact", head: true }).eq("user_id", userId),
  ]);
  
  const questionCount = questionsResult.count || 0;
  const answerCount = answersResult.count || 0;
  const acceptedCount = acceptedResult.count || 0;
  const communityCount = communitiesResult.count || 0;
  
  const badgesToAward = [];
  
  if (questionCount >= 1) badgesToAward.push("first_question");
  if (answerCount >= 1) badgesToAward.push("first_answer");
  if (answerCount >= 10) badgesToAward.push("ten_answers");
  if (answerCount >= 50) badgesToAward.push("fifty_answers");
  if (acceptedCount >= 1) badgesToAward.push("accepted_answer");
  if (communityCount >= 3) badgesToAward.push("active_member");
  
  for (const badge of badgesToAward) {
    await awardBadge(userId, badge);
  }
  
  return badgesToAward;
};
