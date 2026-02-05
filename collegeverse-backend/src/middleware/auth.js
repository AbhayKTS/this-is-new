/**
 * Authentication Middleware
 * Verifies Firebase Auth tokens and attaches user info to request
 */

import { auth, db, collections } from "../config/firebase.js";

/**
 * Verify Firebase ID token
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }
    
    const token = authHeader.split("Bearer ")[1];
    
    // Verify the token
    const decodedToken = await auth.verifyIdToken(token);
    
    // Get user data from Firestore
    const userDoc = await db.collection(collections.STUDENTS).doc(decodedToken.uid).get();
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      ...(userDoc.exists ? userDoc.data() : {}),
    };
    
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/**
 * Optional auth - attaches user if token present, continues otherwise
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }
    
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    const userDoc = await db.collection(collections.STUDENTS).doc(decodedToken.uid).get();
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      ...(userDoc.exists ? userDoc.data() : {}),
    };
    
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

/**
 * Require specific role(s)
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }
    
    next();
  };
};

/**
 * Require verified senior
 */
export const requireVerifiedSenior = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }
  
  if (!req.user.isVerifiedSenior) {
    return res.status(403).json({
      success: false,
      message: "Only verified seniors can perform this action",
    });
  }
  
  next();
};

/**
 * Require college email (student or senior role)
 */
export const requireCollegeEmail = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }
  
  if (!req.user.isCollegeEmail && req.user.role === "explorer") {
    return res.status(403).json({
      success: false,
      message: "This feature requires a college email. Please login with your college email to access all features.",
      upgradeRequired: true,
    });
  }
  
  next();
};

/**
 * Require admin role
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }
  
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  
  next();
};

/**
 * Check specific permission
 */
export const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    
    const ACCESS_LEVELS = {
      explorer: {
        canViewColleges: true,
        canCompareColleges: true,
        canViewPublicReviews: true,
        canAskQuestions: false,
        canAnswerQuestions: false,
        canRateColleges: false,
        canJoinCommunities: false,
      },
      student: {
        canViewColleges: true,
        canCompareColleges: true,
        canViewPublicReviews: true,
        canAskQuestions: true,
        canAnswerQuestions: true,
        canRateColleges: false,
        canJoinCommunities: true,
      },
      senior: {
        canViewColleges: true,
        canCompareColleges: true,
        canViewPublicReviews: true,
        canAskQuestions: true,
        canAnswerQuestions: true,
        canRateColleges: true,
        canJoinCommunities: true,
      },
      admin: {
        canViewColleges: true,
        canCompareColleges: true,
        canViewPublicReviews: true,
        canAskQuestions: true,
        canAnswerQuestions: true,
        canRateColleges: true,
        canJoinCommunities: true,
        canManageUsers: true,
        canApproveVerifications: true,
        canModerateContent: true,
      },
    };
    
    const userAccess = ACCESS_LEVELS[req.user.role] || ACCESS_LEVELS.explorer;
    
    if (!userAccess[permission]) {
      return res.status(403).json({
        success: false,
        message: `You don't have permission to ${permission.replace("can", "").toLowerCase()}`,
        upgradeRequired: req.user.role === "explorer",
      });
    }
    
    next();
  };
};

export default {
  verifyToken,
  optionalAuth,
  requireRole,
  requireVerifiedSenior,
  requireCollegeEmail,
  requireAdmin,
  checkPermission,
};
