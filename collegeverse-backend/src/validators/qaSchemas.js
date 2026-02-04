import { z } from "zod";

export const createQuestionSchema = z.object({
  user_id: z.string().uuid("user_id must be a UUID"),
  community_id: z.string().uuid().optional().nullable(),
  college_id: z.string().uuid().optional().nullable(),
  title: z.string().min(10).max(200),
  body: z.string().min(20).max(5000),
  category: z.enum(["academics", "placements", "hostel", "campus", "admissions", "fees", "infrastructure", "general"]),
  tags: z.array(z.string().max(30)).max(5).optional(),
});

export const createAnswerSchema = z.object({
  user_id: z.string().uuid("user_id must be a UUID"),
  body: z.string().min(10).max(10000),
});

export const voteSchema = z.object({
  user_id: z.string().uuid("user_id must be a UUID"),
});

export const acceptAnswerSchema = z.object({
  user_id: z.string().uuid("user_id must be a UUID (question owner)"),
});

export const questionIdParamSchema = z.object({
  id: z.string().uuid("id must be a UUID"),
});

export const answerIdParamSchema = z.object({
  answerId: z.string().uuid("answerId must be a UUID"),
});

export const voteParamSchema = z.object({
  type: z.enum(["question", "answer"]),
  id: z.string().uuid("id must be a UUID"),
});
