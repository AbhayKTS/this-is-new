/**
 * Verification Service - Firebase Implementation
 * Handles senior verification workflow
 */

import { verificationService as firebaseVerificationService, studentService } from "./firebase/index.js";

/**
 * Senior Verification Service
 * Handles college ID verification for seniors to provide trusted guidance
 */

// Submit a verification request with college ID proof
export const submitVerification = async (payload) => {
  const { user_id, college_id, college_name, graduation_year, id_proof_url, student_email, branch } = payload;
  
  // Check if user already has a pending verification
  const existingVerification = await firebaseVerificationService.getByUser(user_id);
  
  if (existingVerification && existingVerification.status === "pending") {
    throw new Error("You already have a pending verification request");
  }
  
  if (existingVerification && existingVerification.status === "approved") {
    throw new Error("You are already a verified senior");
  }
  
  // Create new verification request
  const verification = await firebaseVerificationService.create({
    userId: user_id,
    collegeId: college_id,
    collegeName: college_name,
    idDocumentUrl: id_proof_url,
    studentEmail: student_email,
    graduationYear: parseInt(graduation_year),
    branch: branch || null,
    status: "pending",
  });
  
  return verification;
};

// Get verification status for a user
export const getVerificationStatus = async (userId) => {
  const verification = await firebaseVerificationService.getByUser(userId);
  
  if (!verification) {
    return {
      exists: false,
      status: null,
      message: "No verification request found",
    };
  }
  
  return {
    exists: true,
    ...verification,
  };
};

// Admin: List pending verifications
export const listPendingVerifications = async ({ page = 1, pageSize = 20 }) => {
  const result = await firebaseVerificationService.listPending({
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });
  
  return {
    data: result.data,
    total: result.total,
    page,
    pageSize,
    totalPages: Math.ceil(result.total / pageSize),
  };
};

// Admin: Approve or reject verification
export const updateVerificationStatus = async (verificationId, status, reviewerNotes = null, reviewerId = null) => {
  // Update verification status
  const verification = await firebaseVerificationService.updateStatus(
    verificationId, 
    status, 
    reviewerId, 
    reviewerNotes
  );
  
  // If approved, upgrade user to verified senior
  if (status === "approved") {
    await studentService.update(verification.userId, {
      role: "senior",
      isVerifiedSenior: true,
      verificationStatus: "approved",
      verificationId: verificationId,
      collegeId: verification.collegeId,
      collegeName: verification.collegeName,
      graduationYear: verification.graduationYear,
      branch: verification.branch,
    });
  } else if (status === "rejected") {
    // Update user's verification status
    await studentService.update(verification.userId, {
      verificationStatus: "rejected",
      verificationId: verificationId,
    });
  }
  
  return verification;
};

// Get all verified seniors for a college
export const getVerifiedSeniors = async (collegeName) => {
  const seniors = await firebaseVerificationService.getApprovedByCollege(collegeName);
  
  // Enrich with student data
  const enrichedSeniors = await Promise.all(
    seniors.map(async (senior) => {
      const student = await studentService.getById(senior.userId);
      return {
        ...senior,
        student: student ? {
          uid: student.uid,
          name: student.name,
          avatar: student.avatar,
          reputation: student.reputation,
          answersGiven: student.answersGiven,
          reviewsWritten: student.reviewsWritten,
        } : null,
      };
    })
  );
  
  return enrichedSeniors;
};
