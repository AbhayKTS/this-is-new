import {
  createQuestion,
  getQuestion,
  listQuestions,
  createAnswer,
  getAnswers,
  upvote,
  acceptAnswer,
  getCategories,
} from "../services/qaService.js";
import { checkActivityBadges } from "../services/badgeService.js";
import { success, created } from "../utils/response.js";

export const createQuestionController = async (req, res, next) => {
  try {
    const data = await createQuestion(req.validatedBody);
    // Check for first question badge
    await checkActivityBadges(req.validatedBody.user_id);
    created(res, data, "Question posted");
  } catch (err) {
    next(err);
  }
};

export const getQuestionController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await getQuestion(id);
    success(res, data, "Question fetched");
  } catch (err) {
    next(err);
  }
};

export const listQuestionsController = async (req, res, next) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      communityId,
      collegeId,
      category,
      status,
      userId,
      sortBy = "newest",
    } = req.query;
    
    const data = await listQuestions({
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
      communityId,
      collegeId,
      category,
      status,
      userId,
      sortBy,
    });
    success(res, data, "Questions fetched");
  } catch (err) {
    next(err);
  }
};

export const createAnswerController = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const data = await createAnswer({ ...req.validatedBody, question_id: questionId });
    // Check for answer badges
    await checkActivityBadges(req.validatedBody.user_id);
    created(res, data, "Answer posted");
  } catch (err) {
    next(err);
  }
};

export const getAnswersController = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { page = 1, pageSize = 50 } = req.query;
    const data = await getAnswers(questionId, {
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
    });
    success(res, data, "Answers fetched");
  } catch (err) {
    next(err);
  }
};

export const upvoteController = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const { user_id } = req.validatedBody;
    const data = await upvote(type, id, user_id);
    success(res, data, `Vote ${data.action}`);
  } catch (err) {
    next(err);
  }
};

export const acceptAnswerController = async (req, res, next) => {
  try {
    const { answerId } = req.params;
    const { user_id } = req.validatedBody;
    const data = await acceptAnswer(answerId, user_id);
    // Check badges for answer owner
    await checkActivityBadges(data.user_id);
    success(res, data, "Answer accepted");
  } catch (err) {
    next(err);
  }
};

export const getCategoriesController = async (req, res, next) => {
  try {
    const data = await getCategories();
    success(res, data, "Categories fetched");
  } catch (err) {
    next(err);
  }
};
