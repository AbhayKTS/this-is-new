import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { verifyToken, optionalAuth } from "../middleware/auth.js";
import {
  createQuestionSchema,
  createAnswerSchema,
  voteSchema,
  acceptAnswerSchema,
  questionIdParamSchema,
  answerIdParamSchema,
  voteParamSchema,
} from "../validators/qaSchemas.js";
import {
  createQuestionController,
  getQuestionController,
  listQuestionsController,
  createAnswerController,
  getAnswersController,
  upvoteController,
  acceptAnswerController,
  getCategoriesController,
} from "../controllers/qaController.js";

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================

// Get Q&A categories
router.get("/categories", getCategoriesController);

// List questions (public with optional auth for personalization)
router.get("/questions", optionalAuth, listQuestionsController);

// Get question by ID (public)
router.get(
  "/questions/:id",
  optionalAuth,
  validate({ params: questionIdParamSchema }),
  getQuestionController
);

// Get answers for a question (public)
router.get("/questions/:questionId/answers", getAnswersController);

// ============================================
// AUTHENTICATED ROUTES
// ============================================

// Create a question (requires auth)
router.post(
  "/questions",
  verifyToken,
  validate({ body: createQuestionSchema }),
  createQuestionController
);

// Post an answer (requires auth)
router.post(
  "/questions/:questionId/answers",
  verifyToken,
  validate({ body: createAnswerSchema }),
  createAnswerController
);

// Upvote a question or answer (requires auth)
router.post(
  "/vote/:type/:id",
  verifyToken,
  validate({ params: voteParamSchema, body: voteSchema }),
  upvoteController
);

// Accept an answer (requires auth - question owner only)
router.post(
  "/answers/:answerId/accept",
  verifyToken,
  validate({ params: answerIdParamSchema, body: acceptAnswerSchema }),
  acceptAnswerController
);

export default router;
