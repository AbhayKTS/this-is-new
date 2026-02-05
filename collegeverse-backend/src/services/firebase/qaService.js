/**
 * Q&A Service - Firebase Operations
 * Handles questions and answers
 */

import { db, collections } from "../../config/firebase.js";
import studentService from "./studentService.js";
import collegeService from "./collegeService.js";

const questionsRef = db.collection(collections.QA_QUESTIONS);
const answersRef = db.collection(collections.QA_ANSWERS);

export const qaService = {
  // ============================================
  // QUESTIONS
  // ============================================
  
  /**
   * Create a question
   */
  async createQuestion(data) {
    const questionData = {
      collegeId: data.collegeId,
      collegeName: data.collegeName,
      
      authorId: data.authorId,
      authorName: data.authorName,
      authorRole: data.authorRole,
      isAnonymous: data.isAnonymous || false,
      
      title: data.title,
      body: data.body,
      tags: data.tags || [],
      category: data.category || "other",
      
      upvotes: 0,
      downvotes: 0,
      viewsCount: 0,
      answersCount: 0,
      
      acceptedAnswerId: null,
      
      status: "open",
      isFeatured: false,
      isPinned: false,
      
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivityAt: new Date(),
    };
    
    const docRef = await questionsRef.add(questionData);
    
    // Update user stats
    await studentService.incrementStat(data.authorId, "questionsAsked");
    
    // Update college stats
    await collegeService.incrementCounter(data.collegeId, "questionsCount");
    
    return { id: docRef.id, ...questionData };
  },
  
  /**
   * Get question by ID
   */
  async getQuestionById(id) {
    const doc = await questionsRef.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },
  
  /**
   * Get questions by college
   */
  async getQuestionsByCollege(collegeId, options = {}) {
    let query = questionsRef.where("collegeId", "==", collegeId);
    
    if (options.category) {
      query = query.where("category", "==", options.category);
    }
    if (options.status) {
      query = query.where("status", "==", options.status);
    }
    
    query = query.orderBy(options.orderBy || "createdAt", options.order || "desc");
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  /**
   * Get questions by user
   */
  async getQuestionsByUser(userId, options = {}) {
    let query = questionsRef.where("authorId", "==", userId);
    query = query.orderBy("createdAt", "desc");
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  /**
   * Search questions
   */
  async searchQuestions(searchTerm, options = {}) {
    // Basic implementation - consider Algolia for production
    let query = questionsRef;
    
    if (options.collegeId) {
      query = query.where("collegeId", "==", options.collegeId);
    }
    
    query = query.orderBy("createdAt", "desc");
    
    if (options.limit) {
      query = query.limit(options.limit * 5); // Get more to filter
    }
    
    const snapshot = await query.get();
    const term = searchTerm.toLowerCase();
    
    const filtered = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(q => 
        q.title.toLowerCase().includes(term) ||
        q.body.toLowerCase().includes(term) ||
        q.tags.some(tag => tag.toLowerCase().includes(term))
      );
    
    return options.limit ? filtered.slice(0, options.limit) : filtered;
  },
  
  /**
   * Update question
   */
  async updateQuestion(id, data) {
    await questionsRef.doc(id).update({
      ...data,
      updatedAt: new Date(),
    });
    return this.getQuestionById(id);
  },
  
  /**
   * Increment view count
   */
  async incrementViews(id) {
    const question = await this.getQuestionById(id);
    if (!question) return null;
    
    await questionsRef.doc(id).update({
      viewsCount: (question.viewsCount || 0) + 1,
    });
  },
  
  /**
   * Vote on question
   */
  async voteQuestion(questionId, userId, voteType) {
    // In production, track user votes in a subcollection to prevent duplicates
    const question = await this.getQuestionById(questionId);
    if (!question) throw new Error("Question not found");
    
    const field = voteType === "up" ? "upvotes" : "downvotes";
    const currentValue = question[field] || 0;
    
    await questionsRef.doc(questionId).update({
      [field]: currentValue + 1,
    });
    
    // Update author reputation
    const points = voteType === "up" ? 5 : -2;
    await studentService.updateReputation(question.authorId, points);
    
    return this.getQuestionById(questionId);
  },
  
  // ============================================
  // ANSWERS
  // ============================================
  
  /**
   * Create an answer
   */
  async createAnswer(data) {
    const answerData = {
      questionId: data.questionId,
      collegeId: data.collegeId,
      
      authorId: data.authorId,
      authorName: data.authorName,
      authorRole: data.authorRole,
      isVerifiedSenior: data.isVerifiedSenior || false,
      isAnonymous: data.isAnonymous || false,
      
      body: data.body,
      
      upvotes: 0,
      downvotes: 0,
      commentsCount: 0,
      
      isAccepted: false,
      isFeatured: false,
      status: "published",
      
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const docRef = await answersRef.add(answerData);
    
    // Update question's answer count and last activity
    const question = await this.getQuestionById(data.questionId);
    await questionsRef.doc(data.questionId).update({
      answersCount: (question?.answersCount || 0) + 1,
      lastActivityAt: new Date(),
      status: "answered",
    });
    
    // Update user stats
    await studentService.incrementStat(data.authorId, "answersGiven");
    
    // Award reputation for answering
    await studentService.updateReputation(data.authorId, 2);
    
    return { id: docRef.id, ...answerData };
  },
  
  /**
   * Get answer by ID
   */
  async getAnswerById(id) {
    const doc = await answersRef.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },
  
  /**
   * Get answers for a question
   */
  async getAnswersByQuestion(questionId, options = {}) {
    let query = answersRef
      .where("questionId", "==", questionId)
      .where("status", "==", "published");
    
    // Sort by accepted first, then by upvotes
    query = query.orderBy("isAccepted", "desc").orderBy("upvotes", "desc");
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  /**
   * Get answers by user
   */
  async getAnswersByUser(userId, options = {}) {
    let query = answersRef
      .where("authorId", "==", userId)
      .where("status", "==", "published");
    
    query = query.orderBy("createdAt", "desc");
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  /**
   * Update answer
   */
  async updateAnswer(id, data) {
    await answersRef.doc(id).update({
      ...data,
      updatedAt: new Date(),
    });
    return this.getAnswerById(id);
  },
  
  /**
   * Vote on answer
   */
  async voteAnswer(answerId, userId, voteType) {
    const answer = await this.getAnswerById(answerId);
    if (!answer) throw new Error("Answer not found");
    
    const field = voteType === "up" ? "upvotes" : "downvotes";
    const currentValue = answer[field] || 0;
    
    await answersRef.doc(answerId).update({
      [field]: currentValue + 1,
    });
    
    // Update author reputation
    const points = voteType === "up" ? 10 : -2;
    await studentService.updateReputation(answer.authorId, points);
    
    // If upvote, also increment helpful votes
    if (voteType === "up") {
      await studentService.incrementStat(answer.authorId, "helpfulVotes");
    }
    
    return this.getAnswerById(answerId);
  },
  
  /**
   * Accept answer (mark as best)
   */
  async acceptAnswer(answerId, questionId, userId) {
    const question = await this.getQuestionById(questionId);
    if (!question) throw new Error("Question not found");
    if (question.authorId !== userId) throw new Error("Only question author can accept answers");
    
    const answer = await this.getAnswerById(answerId);
    if (!answer) throw new Error("Answer not found");
    if (answer.questionId !== questionId) throw new Error("Answer doesn't belong to this question");
    
    // Unaccept previous answer if any
    if (question.acceptedAnswerId) {
      await answersRef.doc(question.acceptedAnswerId).update({ isAccepted: false });
    }
    
    // Accept this answer
    await answersRef.doc(answerId).update({ isAccepted: true });
    
    // Update question
    await questionsRef.doc(questionId).update({
      acceptedAnswerId: answerId,
      status: "closed",
    });
    
    // Award reputation to answer author
    await studentService.updateReputation(answer.authorId, 25);
    
    return this.getAnswerById(answerId);
  },
  
  /**
   * Get recent activity
   */
  async getRecentActivity(collegeId, limit = 20) {
    const [questions, answers] = await Promise.all([
      questionsRef
        .where("collegeId", "==", collegeId)
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get(),
      answersRef
        .where("collegeId", "==", collegeId)
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get(),
    ]);
    
    const activities = [
      ...questions.docs.map(doc => ({ type: "question", id: doc.id, ...doc.data() })),
      ...answers.docs.map(doc => ({ type: "answer", id: doc.id, ...doc.data() })),
    ];
    
    // Sort by createdAt and limit
    return activities
      .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
      .slice(0, limit);
  },
};

export default qaService;

