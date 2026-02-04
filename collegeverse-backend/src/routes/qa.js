import { Router } from "express";
import { validate } from "../middleware/validate.js";
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

// Get Q&A categories
router.get("/categories", getCategoriesController);

// List questions
router.get("/questions", listQuestionsController);

// Create a question
router.post(
  "/questions",
  validate({ body: createQuestionSchema }),
  createQuestionController
);

// Get question by ID
router.get(
  "/questions/:id",
  validate({ params: questionIdParamSchema }),
  getQuestionController
);

// Get answers for a question
router.get("/questions/:questionId/answers", getAnswersController);

// Post an answer
router.post(
  "/questions/:questionId/answers",
  validate({ body: createAnswerSchema }),
  createAnswerController
);

// Upvote a question or answer
router.post(
  "/vote/:type/:id",
  validate({ params: voteParamSchema, body: voteSchema }),
  upvoteController
);

// Accept an answer
router.post(
  "/answers/:answerId/accept",
  validate({ params: answerIdParamSchema, body: acceptAnswerSchema }),
  acceptAnswerController
);

export default router;
