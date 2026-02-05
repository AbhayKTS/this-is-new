/**
 * AI Routes
 * Routes for AI-powered features
 */

import { Router } from "express";
import aiController from "../controllers/aiController.js";
import { optionalAuth, requireAuth, requireRole } from "../middleware/auth.js";
import { rateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Stricter rate limiting for AI endpoints (expensive operations)
const aiRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10 // 10 requests per minute
});

const heavyAiRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5 // 5 requests per minute for heavy operations
});

// ==========================================
// PUBLIC ROUTES
// ==========================================

/**
 * @route   GET /api/ai/status
 * @desc    Get AI service status
 * @access  Public
 */
router.get("/status", aiController.getStatus);

// ==========================================
// SUMMARIZATION ROUTES
// ==========================================

/**
 * @route   GET /api/ai/summarize/qa/:questionId
 * @desc    Get AI summary of a Q&A thread
 * @access  Public (cached), Auth for refresh
 * @query   refresh - Force regenerate summary
 */
router.get(
  "/summarize/qa/:questionId",
  optionalAuth,
  aiRateLimiter,
  aiController.summarizeQA
);

/**
 * @route   GET /api/ai/summarize/reviews/:collegeId
 * @desc    Get AI summary of college reviews
 * @access  Public (cached), Auth for refresh
 * @query   refresh - Force regenerate summary
 */
router.get(
  "/summarize/reviews/:collegeId",
  optionalAuth,
  aiRateLimiter,
  aiController.summarizeReviews
);

// ==========================================
// RECOMMENDATION ROUTES
// ==========================================

/**
 * @route   POST /api/ai/recommendations
 * @desc    Get personalized college recommendations
 * @access  Public (basic), Auth (personalized)
 * @body    {
 *            interestedCourses: string[],
 *            preferredLocations: string[],
 *            budgetRange: { min: number, max: number },
 *            careerGoals: string,
 *            academicScore: number,
 *            priorities: string[],
 *            collegeType: string
 *          }
 */
router.post(
  "/recommendations",
  optionalAuth,
  heavyAiRateLimiter,
  aiController.getRecommendations
);

// ==========================================
// COMPARISON ROUTES
// ==========================================

/**
 * @route   POST /api/ai/compare
 * @desc    Generate AI-powered comparison highlights
 * @access  Public (cached), Auth for refresh
 * @body    { collegeIds: string[] }
 * @query   refresh - Force regenerate comparison
 */
router.post(
  "/compare",
  optionalAuth,
  heavyAiRateLimiter,
  aiController.generateComparison
);

// ==========================================
// MODERATION ROUTES
// ==========================================

/**
 * @route   POST /api/ai/moderate
 * @desc    Full content moderation check
 * @access  Auth required
 * @body    { content: string, contentType: string }
 */
router.post(
  "/moderate",
  requireAuth,
  aiRateLimiter,
  aiController.moderateContent
);

/**
 * @route   POST /api/ai/check-content
 * @desc    Quick content check (for real-time validation)
 * @access  Auth required
 * @body    { content: string, contentType: string }
 */
router.post(
  "/check-content",
  requireAuth,
  rateLimiter({ windowMs: 60 * 1000, max: 30 }), // More lenient for quick checks
  aiController.quickContentCheck
);

export default router;
