/**
 * Q&A Service - Firebase Implementation
 * Handles structured question and answer system for freshers and seniors
 */

import { qaService as firebaseQaService, studentService, badgeService } from "./firebase/index.js";

// Question categories
const CATEGORIES = [
  { id: "academics", name: "Academics", description: "Courses, faculty, curriculum" },
  { id: "placements", name: "Placements", description: "Jobs, packages, companies" },
  { id: "hostel", name: "Hostel Life", description: "Accommodation, food, facilities" },
  { id: "campus", name: "Campus Culture", description: "Events, clubs, social life" },
  { id: "admissions", name: "Admissions", description: "Process, cutoffs, counseling" },
  { id: "fees", name: "Fees & Scholarships", description: "Costs, financial aid" },
  { id: "infrastructure", name: "Infrastructure", description: "Labs, library, sports" },
  { id: "general", name: "General", description: "Other questions" },
];

// Post a new question
export const createQuestion = async (payload) => {
  const { user_id, community_id, college_id, title, body, category, tags } = payload;
  
  // Get user info for denormalization
  const user = await studentService.getById(user_id);
  
  const question = await firebaseQaService.createQuestion({
    authorId: user_id,
    authorName: user?.name || "Anonymous",
    authorAvatar: user?.avatar || null,
    isVerifiedSenior: user?.isVerifiedSenior || false,
    communityId: community_id || null,
    collegeId: college_id || null,
    title,
    body,
    category: category || "general",
    tags: tags || [],
  });
  
  // Increment user's question count
  await studentService.incrementStat(user_id, "questionsAsked");
  
  return question;
};

// Get question by ID with answers
export const getQuestion = async (questionId) => {
  const question = await firebaseQaService.getQuestionById(questionId);
  
  if (!question) {
    throw new Error("Question not found");
  }
  
  // Increment view count
  await firebaseQaService.incrementViews(questionId);
  
  // Get answers
  const answers = await firebaseQaService.getAnswersForQuestion(questionId);
  
  return {
    ...question,
    answers,
  };
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
  sortBy = "newest",
  searchQuery = null,
}) => {
  const result = await firebaseQaService.listQuestions({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    communityId,
    collegeId,
    category,
    status,
    authorId: userId,
    sortBy,
    searchQuery,
  });
  
  return {
    data: result.data,
    total: result.total,
    page,
    pageSize,
    totalPages: Math.ceil(result.total / pageSize),
  };
};

// Post an answer
export const createAnswer = async (payload) => {
  const { question_id, user_id, body } = payload;
  
  // Get user info
  const user = await studentService.getById(user_id);
  
  const answer = await firebaseQaService.createAnswer(question_id, {
    authorId: user_id,
    authorName: user?.name || "Anonymous",
    authorAvatar: user?.avatar || null,
    isVerifiedSenior: user?.isVerifiedSenior || false,
    body,
  });
  
  // Update user stats
  await studentService.incrementStat(user_id, "answersGiven");
  
  // Award reputation for answering
  await awardReputationPoints(user_id, 5, "answer_posted");
  
  return answer;
};

// Get answers for a question
export const getAnswers = async (questionId, { page = 1, pageSize = 50 }) => {
  const answers = await firebaseQaService.getAnswersForQuestion(questionId, {
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });
  
  return {
    data: answers,
    total: answers.length,
    page,
    pageSize,
  };
};

// Upvote a question or answer
export const upvote = async (type, itemId, userId) => {
  if (type === "question") {
    const result = await firebaseQaService.voteQuestion(itemId, userId, "up");
    return result;
  } else {
    const result = await firebaseQaService.voteAnswer(itemId, userId, "up");
    
    // Award reputation if upvoted (not removed)
    if (result.action === "upvoted") {
      const answer = await firebaseQaService.getAnswerById(itemId);
      if (answer) {
        await awardReputationPoints(answer.authorId, 2, "answer_upvoted");
      }
    }
    
    return result;
  }
};

// Downvote a question or answer
export const downvote = async (type, itemId, userId) => {
  if (type === "question") {
    return await firebaseQaService.voteQuestion(itemId, userId, "down");
  } else {
    return await firebaseQaService.voteAnswer(itemId, userId, "down");
  }
};

// Accept an answer (question owner only)
export const acceptAnswer = async (answerId, questionOwnerId) => {
  // Get the answer to find the question
  const answer = await firebaseQaService.getAnswerById(answerId);
  
  if (!answer) {
    throw new Error("Answer not found");
  }
  
  // Get the question to verify ownership
  const question = await firebaseQaService.getQuestionById(answer.questionId);
  
  if (!question) {
    throw new Error("Question not found");
  }
  
  if (question.authorId !== questionOwnerId) {
    throw new Error("Only question owner can accept answers");
  }
  
  // Accept the answer
  const updated = await firebaseQaService.acceptAnswer(answer.questionId, answerId);
  
  // Award reputation to answerer
  await awardReputationPoints(answer.authorId, 15, "answer_accepted");
  
  return updated;
};

// Award reputation points to user
export const awardReputationPoints = async (userId, points, reason) => {
  // Update reputation
  const newReputation = await studentService.updateReputation(userId, points);
  
  // Check for badge eligibility
  await checkBadgeEligibility(userId, newReputation);
  
  return newReputation;
};

// Check and award badges based on reputation/activity
const checkBadgeEligibility = async (userId, reputation) => {
  const badgesToAward = [];
  
  if (reputation >= 100) badgesToAward.push("helpful_contributor");
  if (reputation >= 500) badgesToAward.push("trusted_guide");
  if (reputation >= 1000) badgesToAward.push("community_champion");
  
  for (const badgeType of badgesToAward) {
    try {
      await badgeService.awardBadge(userId, badgeType, { autoAwarded: true, reason: "reputation_milestone" });
    } catch (e) {
      // Badge might already be awarded
    }
  }
};

// Update question
export const updateQuestion = async (questionId, userId, updateData) => {
  const question = await firebaseQaService.getQuestionById(questionId);
  
  if (!question) {
    throw new Error("Question not found");
  }
  
  if (question.authorId !== userId) {
    throw new Error("You can only edit your own questions");
  }
  
  return await firebaseQaService.updateQuestion(questionId, {
    title: updateData.title,
    body: updateData.body,
    category: updateData.category,
    tags: updateData.tags,
  });
};

// Delete question
export const deleteQuestion = async (questionId, userId, isAdmin = false) => {
  const question = await firebaseQaService.getQuestionById(questionId);
  
  if (!question) {
    throw new Error("Question not found");
  }
  
  if (!isAdmin && question.authorId !== userId) {
    throw new Error("You can only delete your own questions");
  }
  
  await firebaseQaService.deleteQuestion(questionId);
  return { success: true };
};

// Update answer
export const updateAnswer = async (answerId, userId, body) => {
  const answer = await firebaseQaService.getAnswerById(answerId);
  
  if (!answer) {
    throw new Error("Answer not found");
  }
  
  if (answer.authorId !== userId) {
    throw new Error("You can only edit your own answers");
  }
  
  return await firebaseQaService.updateAnswer(answerId, { body });
};

// Delete answer
export const deleteAnswer = async (answerId, userId, isAdmin = false) => {
  const answer = await firebaseQaService.getAnswerById(answerId);
  
  if (!answer) {
    throw new Error("Answer not found");
  }
  
  if (!isAdmin && answer.authorId !== userId) {
    throw new Error("You can only delete your own answers");
  }
  
  await firebaseQaService.deleteAnswer(answer.questionId, answerId);
  return { success: true };
};

// Get question categories
export const getCategories = async () => {
  return CATEGORIES;
};

// Search questions
export const searchQuestions = async (query, options = {}) => {
  return await listQuestions({
    ...options,
    searchQuery: query,
  });
};

// Get trending questions
export const getTrendingQuestions = async (limit = 10, collegeId = null) => {
  return await listQuestions({
    pageSize: limit,
    collegeId,
    sortBy: "popular",
  });
};

// Get unanswered questions
export const getUnansweredQuestions = async (limit = 10, collegeId = null) => {
  return await listQuestions({
    pageSize: limit,
    collegeId,
    status: "open",
    sortBy: "newest",
  });
};
