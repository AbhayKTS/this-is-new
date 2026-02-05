/**
 * Content Moderation Middleware
 * Automatically moderates content before it's saved
 */

import { moderateContent } from "../services/aiService.js";
import { env } from "../config/env.js";

/**
 * Middleware to moderate content in request body
 * @param {string[]} fields - Array of field names to moderate
 * @param {object} options - Moderation options
 */
export const moderate = (fields = ["content"], options = {}) => {
  const {
    contentType = "general",
    blockSevere = true,
    blockModerate = false,
    warnMild = true
  } = options;

  return async (req, res, next) => {
    // Skip if moderation is disabled
    if (!env.aiModerationEnabled) {
      return next();
    }

    try {
      const textsToModerate = [];
      
      // Collect all text fields to moderate
      for (const field of fields) {
        const value = getNestedValue(req.body, field);
        if (value && typeof value === "string" && value.trim()) {
          textsToModerate.push({ field, value: value.trim() });
        } else if (Array.isArray(value)) {
          // Handle arrays (like pros/cons)
          value.forEach((item, index) => {
            if (typeof item === "string" && item.trim()) {
              textsToModerate.push({ field: `${field}[${index}]`, value: item.trim() });
            }
          });
        }
      }

      if (textsToModerate.length === 0) {
        return next();
      }

      // Combine texts for single moderation call
      const combinedText = textsToModerate.map(t => t.value).join("\n\n");
      const result = await moderateContent(combinedText, contentType);

      // Attach moderation result to request for logging
      req.moderationResult = result;

      // Handle severe violations
      if (result.category === "severe" && blockSevere) {
        return res.status(400).json({
          success: false,
          message: "Your content violates our community guidelines",
          moderationResult: {
            category: result.category,
            flags: result.flags,
            suggestion: result.editSuggestion || "Please remove inappropriate content and try again"
          }
        });
      }

      // Handle moderate violations
      if (result.category === "moderate" && blockModerate) {
        return res.status(400).json({
          success: false,
          message: "Your content may violate our community guidelines",
          moderationResult: {
            category: result.category,
            flags: result.flags,
            suggestion: result.editSuggestion || "Please review your content and try again"
          }
        });
      }

      // Handle mild content (warn but allow)
      if (result.category === "mild" && warnMild) {
        // Add warning to response headers
        res.set("X-Content-Warning", "mild-language-detected");
      }

      // Mark content as flagged for review if not approved
      if (!result.approved) {
        req.contentFlagged = true;
        req.flagReason = result.reason;
      }

      next();
    } catch (error) {
      console.error("Moderation middleware error:", error);
      // Don't block on moderation errors, just log and continue
      next();
    }
  };
};

/**
 * Quick moderation for real-time input validation
 * Returns result without blocking
 */
export const quickModerate = (fields = ["content"]) => {
  return async (req, res, next) => {
    if (!env.aiModerationEnabled) {
      req.moderationResult = { approved: true, category: "clean" };
      return next();
    }

    try {
      const textsToModerate = [];
      
      for (const field of fields) {
        const value = getNestedValue(req.body, field);
        if (value && typeof value === "string" && value.trim()) {
          textsToModerate.push(value.trim());
        }
      }

      if (textsToModerate.length === 0) {
        req.moderationResult = { approved: true, category: "clean" };
        return next();
      }

      const combinedText = textsToModerate.join("\n\n");
      const result = await moderateContent(combinedText, "general");
      req.moderationResult = result;
      
      next();
    } catch (error) {
      console.error("Quick moderation error:", error);
      req.moderationResult = { approved: true, category: "unknown", error: true };
      next();
    }
  };
};

/**
 * Helper to get nested object values
 */
function getNestedValue(obj, path) {
  return path.split(".").reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

export default { moderate, quickModerate };
