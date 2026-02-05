/**
 * Authentication Routes
 * Handles user registration, login, and profile management
 */

import { Router } from "express";
import { auth, db, collections } from "../config/firebase.js";
import { studentService } from "../services/firebase/index.js";
import { verifyToken, optionalAuth } from "../middleware/auth.js";

const router = Router();

// ============================================
// COLLEGE EMAIL DOMAINS (add more as needed)
// ============================================
const COLLEGE_EMAIL_PATTERNS = [
  /\.edu$/i,
  /\.edu\.\w+$/i,
  /\.ac\.\w+$/i,
  /\.college$/i,
  // Add specific college domains
  /iitb\.ac\.in$/i,
  /iitd\.ac\.in$/i,
  /iitm\.ac\.in$/i,
  /bits-pilani\.ac\.in$/i,
  /vit\.ac\.in$/i,
  /srm\.edu\.in$/i,
  /manipal\.edu$/i,
  /amity\.edu$/i,
  /lpu\.in$/i,
];

const isCollegeEmail = (email) => {
  if (!email) return false;
  return COLLEGE_EMAIL_PATTERNS.some(pattern => pattern.test(email));
};

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post("/register", async (req, res, next) => {
  try {
    const { email, password, name, phone } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }
    
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: email.toLowerCase(),
      password,
      displayName: name || "",
    });
    
    // Determine role based on email type
    const collegeEmail = isCollegeEmail(email);
    const role = collegeEmail ? "student" : "explorer";
    
    // Create user document in Firestore
    const userData = await studentService.create(userRecord.uid, {
      email: email.toLowerCase(),
      name: name || "",
      phone: phone || null,
      role,
      isCollegeEmail: collegeEmail,
    });
    
    // Generate custom token for immediate login
    const customToken = await auth.createCustomToken(userRecord.uid);
    
    res.status(201).json({
      success: true,
      message: collegeEmail 
        ? "Registration successful! You have full access with your college email."
        : "Registration successful! You're in Explorer mode. Use a college email for full access.",
      data: {
        uid: userRecord.uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        isCollegeEmail: collegeEmail,
        customToken,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    
    if (error.code === "auth/email-already-exists") {
      return res.status(409).json({
        success: false,
        message: "This email is already registered. Please login instead.",
      });
    }
    
    if (error.code === "auth/invalid-email") {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }
    
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login is handled client-side with Firebase Auth
 * This endpoint validates token and returns user data
 */
router.post("/login", verifyToken, async (req, res, next) => {
  try {
    // User is already verified by middleware
    const user = req.user;
    
    // Update last login
    await studentService.updateLastLogin(user.uid);
    
    res.json({
      success: true,
      message: "Login successful",
      data: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        isCollegeEmail: user.isCollegeEmail,
        isVerifiedSenior: user.isVerifiedSenior,
        collegeId: user.collegeId,
        collegeName: user.collegeName,
        reputation: user.reputation,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get("/me", verifyToken, async (req, res, next) => {
  try {
    const userData = await studentService.getById(req.user.uid);
    
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    res.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put("/profile", verifyToken, async (req, res, next) => {
  try {
    const { name, phone, bio, avatar, interests, notificationPrefs } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (interests !== undefined) updateData.interests = interests;
    if (notificationPrefs !== undefined) updateData.notificationPrefs = notificationPrefs;
    
    const updated = await studentService.update(req.user.uid, updateData);
    
    res.json({
      success: true,
      message: "Profile updated",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/check-email
 * Check if email is college email and get access level
 */
router.post("/check-email", (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }
  
  const collegeEmail = isCollegeEmail(email);
  
  res.json({
    success: true,
    data: {
      email,
      isCollegeEmail: collegeEmail,
      accessLevel: collegeEmail ? "full" : "limited",
      role: collegeEmail ? "student" : "explorer",
      message: collegeEmail 
        ? "College email detected! You'll get full access."
        : "Personal email. You'll have limited Explorer access.",
    },
  });
});

/**
 * POST /api/auth/save-college
 * Save a college to favorites
 */
router.post("/save-college", verifyToken, async (req, res, next) => {
  try {
    const { collegeId } = req.body;
    
    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: "College ID is required",
      });
    }
    
    const savedColleges = await studentService.saveCollege(req.user.uid, collegeId);
    
    res.json({
      success: true,
      message: "College saved",
      data: { savedColleges },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/auth/save-college/:collegeId
 * Remove college from favorites
 */
router.delete("/save-college/:collegeId", verifyToken, async (req, res, next) => {
  try {
    const { collegeId } = req.params;
    
    const savedColleges = await studentService.unsaveCollege(req.user.uid, collegeId);
    
    res.json({
      success: true,
      message: "College removed from saved",
      data: { savedColleges },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/saved-colleges
 * Get user's saved colleges
 */
router.get("/saved-colleges", verifyToken, async (req, res, next) => {
  try {
    const user = await studentService.getById(req.user.uid);
    
    res.json({
      success: true,
      data: user?.savedColleges || [],
    });
  } catch (error) {
    next(error);
  }
});

export default router;
