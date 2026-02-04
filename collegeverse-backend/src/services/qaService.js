import { supabase } from "../lib/supabaseClient.js";

/**
 * Q&A Service
 * Handles structured question and answer system for freshers and seniors
 */

// Post a new question
export const createQuestion = async (payload) => {
  const { user_id, community_id, college_id, title, body, category, tags } = payload;
  
  const { data, error } = await supabase
    .from("questions")
    .insert({
      user_id,
      community_id,
      college_id,
      title,
      body,
      category,
      tags: tags || [],
      status: "open",
      view_count: 0,
      answer_count: 0,
      upvotes: 0,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Get question by ID with answers
export const getQuestion = async (questionId) => {
  const { data, error } = await supabase
    .from("questions")
    .select(`
      *,
      users(id, name, is_verified_senior, verified_college),
      communities(id, name),
      colleges(id, name)
    `)
    .eq("id", questionId)
    .single();
  
  if (error) throw error;
  
  // Increment view count
  await supabase
    .from("questions")
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq("id", questionId);
  
  return data;
};

// List questions with filters
export const listQuestions = async ({
  page = 1,
  pageSize = 20,
  communityId = null,
  collegeId = null,
  category = null,
  status = null,
  userId = null,
  sortBy = "newest"
}) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  let query = supabase
    .from("questions")
    .select(`
      *,
      users(id, name, is_verified_senior, verified_college),
      communities(id, name)
    `, { count: "exact" });
  
  if (communityId) query = query.eq("community_id", communityId);
  if (collegeId) query = query.eq("college_id", collegeId);
  if (category) query = query.eq("category", category);
  if (status) query = query.eq("status", status);
  if (userId) query = query.eq("user_id", userId);
  
  // Sort options
  switch (sortBy) {
    case "popular":
      query = query.order("view_count", { ascending: false });
      break;
    case "unanswered":
      query = query.eq("answer_count", 0).order("created_at", { ascending: false });
      break;
    case "mostVoted":
      query = query.order("upvotes", { ascending: false });
      break;
    default: // newest
      query = query.order("created_at", { ascending: false });
  }
  
  const { data, error, count } = await query.range(from, to);
  
  if (error) throw error;
  return { data, total: count || 0, page, pageSize };
};

// Post an answer
export const createAnswer = async (payload) => {
  const { question_id, user_id, body } = payload;
  
  const { data, error } = await supabase
    .from("answers")
    .insert({
      question_id,
      user_id,
      body,
      upvotes: 0,
      is_accepted: false,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Increment answer count on question
  await supabase.rpc("increment_answer_count", { question_id });
  
  // Award XP to answerer
  await awardReputationPoints(user_id, 5, "answer_posted");
  
  return data;
};

// Get answers for a question
export const getAnswers = async (questionId, { page = 1, pageSize = 50 }) => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  const { data, error, count } = await supabase
    .from("answers")
    .select(`
      *,
      users(id, name, is_verified_senior, verified_college)
    `, { count: "exact" })
    .eq("question_id", questionId)
    .order("is_accepted", { ascending: false })
    .order("upvotes", { ascending: false })
    .order("created_at", { ascending: true })
    .range(from, to);
  
  if (error) throw error;
  return { data, total: count || 0, page, pageSize };
};

// Upvote a question or answer
export const upvote = async (type, itemId, userId) => {
  const table = type === "question" ? "question_votes" : "answer_votes";
  const itemColumn = type === "question" ? "question_id" : "answer_id";
  
  // Check if already voted
  const { data: existing } = await supabase
    .from(table)
    .select("id, vote_type")
    .eq(itemColumn, itemId)
    .eq("user_id", userId)
    .maybeSingle();
  
  if (existing) {
    if (existing.vote_type === "up") {
      // Remove vote
      await supabase.from(table).delete().eq("id", existing.id);
      await updateVoteCount(type, itemId, -1);
      return { action: "removed" };
    } else {
      // Change from downvote to upvote
      await supabase.from(table).update({ vote_type: "up" }).eq("id", existing.id);
      await updateVoteCount(type, itemId, 2);
      return { action: "changed" };
    }
  }
  
  // New upvote
  await supabase.from(table).insert({
    [itemColumn]: itemId,
    user_id: userId,
    vote_type: "up",
    created_at: new Date().toISOString(),
  });
  await updateVoteCount(type, itemId, 1);
  
  return { action: "upvoted" };
};

// Helper to update vote count
const updateVoteCount = async (type, itemId, delta) => {
  const table = type === "question" ? "questions" : "answers";
  await supabase.rpc("update_upvotes", { table_name: table, item_id: itemId, delta });
};

// Accept an answer (question owner only)
export const acceptAnswer = async (answerId, questionOwnerId) => {
  // Get the answer
  const { data: answer, error: answerError } = await supabase
    .from("answers")
    .select("*, questions(user_id)")
    .eq("id", answerId)
    .single();
  
  if (answerError) throw answerError;
  
  // Verify ownership
  if (answer.questions.user_id !== questionOwnerId) {
    throw new Error("Only question owner can accept answers");
  }
  
  // Unaccept any previously accepted answer
  await supabase
    .from("answers")
    .update({ is_accepted: false })
    .eq("question_id", answer.question_id);
  
  // Accept this answer
  const { data, error } = await supabase
    .from("answers")
    .update({ is_accepted: true })
    .eq("id", answerId)
    .select()
    .single();
  
  if (error) throw error;
  
  // Mark question as answered
  await supabase
    .from("questions")
    .update({ status: "answered" })
    .eq("id", answer.question_id);
  
  // Award reputation to answerer
  await awardReputationPoints(answer.user_id, 15, "answer_accepted");
  
  return data;
};

// Award reputation points to user
export const awardReputationPoints = async (userId, points, reason) => {
  await supabase
    .from("reputation_history")
    .insert({
      user_id: userId,
      points,
      reason,
      created_at: new Date().toISOString(),
    });
  
  // Update total reputation
  await supabase.rpc("update_user_reputation", { user_id: userId, points });
  
  // Check for badge eligibility
  await checkBadgeEligibility(userId);
};

// Check and award badges based on reputation/activity
const checkBadgeEligibility = async (userId) => {
  const { data: user } = await supabase
    .from("users")
    .select("reputation_score")
    .eq("id", userId)
    .single();
  
  if (!user) return;
  
  const badges = [];
  
  if (user.reputation_score >= 100) badges.push("helpful_contributor");
  if (user.reputation_score >= 500) badges.push("trusted_guide");
  if (user.reputation_score >= 1000) badges.push("community_champion");
  
  for (const badge of badges) {
    await supabase
      .from("user_badges")
      .upsert({
        user_id: userId,
        badge_type: badge,
        awarded_at: new Date().toISOString(),
      }, { onConflict: "user_id,badge_type" });
  }
};

// Get question categories
export const getCategories = async () => {
  return [
    { id: "academics", name: "Academics", description: "Courses, faculty, curriculum" },
    { id: "placements", name: "Placements", description: "Jobs, packages, companies" },
    { id: "hostel", name: "Hostel Life", description: "Accommodation, food, facilities" },
    { id: "campus", name: "Campus Culture", description: "Events, clubs, social life" },
    { id: "admissions", name: "Admissions", description: "Process, cutoffs, counseling" },
    { id: "fees", name: "Fees & Scholarships", description: "Costs, financial aid" },
    { id: "infrastructure", name: "Infrastructure", description: "Labs, library, sports" },
    { id: "general", name: "General", description: "Other questions" },
  ];
};
