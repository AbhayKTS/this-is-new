/**
 * Verification Service - Firebase Operations
 * Handles senior verification requests
 */

import { db, collections } from "../../config/firebase.js";
import studentService from "./studentService.js";
import collegeService from "./collegeService.js";

const verificationsRef = db.collection(collections.SENIORS_VERIFICATION);

export const verificationService = {
  /**
   * Submit verification request
   */
  async submitRequest(userId, data) {
    // Check if user already has a pending request
    const existing = await this.getByUserId(userId);
    if (existing && existing.status === "pending") {
      throw new Error("You already have a pending verification request");
    }
    
    const verificationData = {
      userId,
      userEmail: data.userEmail,
      userName: data.userName,
      
      collegeId: data.collegeId,
      collegeName: data.collegeName,
      branch: data.branch,
      year: data.year,
      enrollmentNumber: data.enrollmentNumber,
      
      collegeIdCard: data.collegeIdCard,        // URL to uploaded image
      marksheet: data.marksheet || null,
      linkedinProfile: data.linkedinProfile || null,
      additionalProof: data.additionalProof || null,
      
      status: "pending",
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: null,
      
      submittedAt: new Date(),
      expiresAt: this.calculateExpiry(data.year),
    };
    
    const docRef = await verificationsRef.add(verificationData);
    
    // Update user's verification status
    await studentService.update(userId, {
      verificationStatus: "pending",
      verificationId: docRef.id,
    });
    
    return { id: docRef.id, ...verificationData };
  },
  
  /**
   * Calculate verification expiry (end of graduation year)
   */
  calculateExpiry(graduationYear) {
    const expiry = new Date();
    expiry.setFullYear(graduationYear, 5, 30); // June 30 of graduation year
    return expiry;
  },
  
  /**
   * Get verification by ID
   */
  async getById(id) {
    const doc = await verificationsRef.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },
  
  /**
   * Get verification by user ID
   */
  async getByUserId(userId) {
    const snapshot = await verificationsRef
      .where("userId", "==", userId)
      .orderBy("submittedAt", "desc")
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  },
  
  /**
   * Get pending verifications (for admin)
   */
  async getPending(options = {}) {
    let query = verificationsRef.where("status", "==", "pending");
    
    if (options.collegeId) {
      query = query.where("collegeId", "==", options.collegeId);
    }
    
    query = query.orderBy("submittedAt", "asc");
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  /**
   * Get all verifications (for admin)
   */
  async getAll(options = {}) {
    let query = verificationsRef;
    
    if (options.status) {
      query = query.where("status", "==", options.status);
    }
    if (options.collegeId) {
      query = query.where("collegeId", "==", options.collegeId);
    }
    
    query = query.orderBy("submittedAt", "desc");
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  /**
   * Approve verification (admin)
   */
  async approve(verificationId, adminId) {
    const verification = await this.getById(verificationId);
    if (!verification) throw new Error("Verification request not found");
    if (verification.status !== "pending") throw new Error("Request is not pending");
    
    // Update verification document
    await verificationsRef.doc(verificationId).update({
      status: "approved",
      reviewedBy: adminId,
      reviewedAt: new Date(),
    });
    
    // Update user to senior role
    await studentService.update(verification.userId, {
      role: "senior",
      isVerifiedSenior: true,
      verificationStatus: "approved",
      collegeId: verification.collegeId,
      collegeName: verification.collegeName,
      branch: verification.branch,
      year: verification.year,
      enrollmentNumber: verification.enrollmentNumber,
    });
    
    // Increment college's verified seniors count
    await collegeService.incrementCounter(verification.collegeId, "verifiedSeniorsCount");
    
    // Award "Verified Senior" badge
    // TODO: Implement badge awarding
    
    // Add reputation points
    await studentService.updateReputation(verification.userId, 100);
    
    return this.getById(verificationId);
  },
  
  /**
   * Reject verification (admin)
   */
  async reject(verificationId, adminId, reason) {
    const verification = await this.getById(verificationId);
    if (!verification) throw new Error("Verification request not found");
    if (verification.status !== "pending") throw new Error("Request is not pending");
    
    // Update verification document
    await verificationsRef.doc(verificationId).update({
      status: "rejected",
      reviewedBy: adminId,
      reviewedAt: new Date(),
      rejectionReason: reason,
    });
    
    // Update user's verification status
    await studentService.update(verification.userId, {
      verificationStatus: "rejected",
    });
    
    return this.getById(verificationId);
  },
  
  /**
   * Resubmit after rejection
   */
  async resubmit(verificationId, userId, data) {
    const verification = await this.getById(verificationId);
    if (!verification) throw new Error("Verification request not found");
    if (verification.userId !== userId) throw new Error("Unauthorized");
    if (verification.status !== "rejected") throw new Error("Can only resubmit rejected requests");
    
    // Update with new data
    await verificationsRef.doc(verificationId).update({
      ...data,
      status: "pending",
      reviewedBy: null,
      reviewedAt: null,
      rejectionReason: null,
      submittedAt: new Date(),
    });
    
    // Update user status
    await studentService.update(userId, {
      verificationStatus: "pending",
    });
    
    return this.getById(verificationId);
  },
  
  /**
   * Get verification stats (for admin dashboard)
   */
  async getStats() {
    const [pending, approved, rejected] = await Promise.all([
      verificationsRef.where("status", "==", "pending").get(),
      verificationsRef.where("status", "==", "approved").get(),
      verificationsRef.where("status", "==", "rejected").get(),
    ]);
    
    return {
      pending: pending.size,
      approved: approved.size,
      rejected: rejected.size,
      total: pending.size + approved.size + rejected.size,
    };
  },
};

export default verificationService;

