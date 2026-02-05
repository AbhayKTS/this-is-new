/**
 * AI Controller
 * Handles all AI-powered API endpoints
 */

import aiService from "../services/aiService.js";

/**
 * Get AI service status
 * GET /api/ai/status
 */
export const getStatus = async (req, res, next) => {
  try {
    const status = aiService.getAIStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Summarize a Q&A thread
 * GET /api/ai/summarize/qa/:questionId
 */
export const summarizeQA = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { refresh } = req.query;

    // Check cache first unless refresh requested
    if (!refresh) {
      const cached = await aiService.getCachedSummary("qa", questionId);
      if (cached) {
        return res.json({
          success: true,
          data: cached,
          cached: true
        });
      }
    }

    const summary = await aiService.summarizeQAThread(questionId);
    
    res.json({
      success: true,
      data: summary,
      cached: false
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Summarize college reviews
 * GET /api/ai/summarize/reviews/:collegeId
 */
export const summarizeReviews = async (req, res, next) => {
  try {
    const { collegeId } = req.params;
    const { refresh } = req.query;

    // Check cache first unless refresh requested
    if (!refresh) {
      const cached = await aiService.getCachedSummary("reviews", collegeId);
      if (cached) {
        return res.json({
          success: true,
          data: cached,
          cached: true
        });
      }
    }

    const summary = await aiService.summarizeCollegeReviews(collegeId);
    
    res.json({
      success: true,
      data: summary,
      cached: false
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get personalized college recommendations
 * POST /api/ai/recommendations
 */
export const getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user?.uid || null;
    const preferences = req.body;

    const recommendations = await aiService.getCollegeRecommendations(userId, preferences);
    
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate comparison highlights
 * POST /api/ai/compare
 */
export const generateComparison = async (req, res, next) => {
  try {
    const { collegeIds } = req.body;
    const { refresh } = req.query;

    if (!collegeIds || !Array.isArray(collegeIds) || collegeIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least 2 college IDs to compare"
      });
    }

    if (collegeIds.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 colleges can be compared at once"
      });
    }

    // Check cache first unless refresh requested
    if (!refresh) {
      const cacheKey = collegeIds.sort().join("_");
      const cached = await aiService.getCachedSummary("comparison", cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached,
          cached: true
        });
      }
    }

    const comparison = await aiService.generateComparisonHighlights(collegeIds);
    
    res.json({
      success: true,
      data: comparison,
      cached: false
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Moderate content
 * POST /api/ai/moderate
 */
export const moderateContent = async (req, res, next) => {
  try {
    const { content, contentType } = req.body;

    if (!content || typeof content !== "string") {
      return res.status(400).json({
        success: false,
        message: "Content is required"
      });
    }

    if (content.length > 10000) {
      return res.status(400).json({
        success: false,
        message: "Content too long (max 10000 characters)"
      });
    }

    const result = await aiService.moderateContent(content, contentType || "general");
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Quick content check (for real-time validation)
 * POST /api/ai/check-content
 */
export const quickContentCheck = async (req, res, next) => {
  try {
    const { content, contentType } = req.body;

    if (!content || typeof content !== "string") {
      return res.status(400).json({
        success: false,
        message: "Content is required"
      });
    }

    // For quick checks, use basic moderation only
    const result = await aiService.moderateContent(content, contentType || "general");
    
    // Return simplified response for quick checks
    res.json({
      success: true,
      data: {
        approved: result.approved,
        category: result.category,
        flags: result.flags
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getStatus,
  summarizeQA,
  summarizeReviews,
  getRecommendations,
  generateComparison,
  moderateContent,
  quickContentCheck
};
