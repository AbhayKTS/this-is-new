/**
 * Reviews Service - Firebase Operations
 */

import { db, collections } from "../../config/firebase.js";
import studentService from "./studentService.js";
import collegeService from "./collegeService.js";

const reviewsRef = db.collection(collections.REVIEWS);

export const reviewsService = {
  /**
   * Create a review
   */
  async create(data) {
    const user = await studentService.getById(data.authorId);
    if (!user) throw new Error("User not found");
    
    const college = await collegeService.getById(data.collegeId);
    if (!college) throw new Error("College not found");
    
    const reviewData = {
      collegeId: data.collegeId,
      collegeName: college.name,
      
      authorId: data.authorId,
      authorName: data.isAnonymous ? "Anonymous" : user.name,
      authorRole: user.role,
      isVerifiedSenior: user.isVerifiedSenior,
      
      title: data.title,
      content: data.content,
      pros: data.pros || [],
      cons: data.cons || [],
      
      ratings: data.ratings || {},
      
      helpfulCount: 0,
      notHelpfulCount: 0,
      commentsCount: 0,
      
      status: "published",
      isAnonymous: data.isAnonymous || false,
      
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const docRef = await reviewsRef.add(reviewData);
    
    // Update user stats
    await studentService.incrementStat(data.authorId, "reviewsWritten");
    
    // Update college stats
    await collegeService.incrementCounter(data.collegeId, "reviewsCount");
    
    // Award reputation
    await studentService.updateReputation(data.authorId, 10);
    
    return { id: docRef.id, ...reviewData };
  },
  
  /**
   * Get review by ID
   */
  async getById(id) {
    const doc = await reviewsRef.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },
  
  /**
   * Get reviews by college
   */
  async getByCollege(collegeId, options = {}) {
    let query = reviewsRef
      .where("collegeId", "==", collegeId)
      .where("status", "==", "published");
    
    query = query.orderBy(options.orderBy || "createdAt", options.order || "desc");
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  /**
   * Get reviews by user
   */
  async getByUser(userId) {
    const snapshot = await reviewsRef
      .where("authorId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  /**
   * Update review
   */
  async update(id, data) {
    await reviewsRef.doc(id).update({
      ...data,
      updatedAt: new Date(),
    });
    return this.getById(id);
  },
  
  /**
   * Mark as helpful
   */
  async markHelpful(id, isHelpful) {
    const review = await this.getById(id);
    if (!review) throw new Error("Review not found");
    
    const field = isHelpful ? "helpfulCount" : "notHelpfulCount";
    await reviewsRef.doc(id).update({
      [field]: (review[field] || 0) + 1,
    });
    
    // Award reputation if helpful
    if (isHelpful) {
      await studentService.updateReputation(review.authorId, 3);
    }
    
    return this.getById(id);
  },
  
  /**
   * Flag review
   */
  async flag(id, reason) {
    await reviewsRef.doc(id).update({
      status: "flagged",
      flagReason: reason,
      flaggedAt: new Date(),
    });
    return this.getById(id);
  },
};

export default reviewsService;

