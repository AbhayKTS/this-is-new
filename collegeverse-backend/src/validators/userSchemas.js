import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  college: z.string().optional().nullable(),
  score: z.number().optional().nullable(),
  rank: z.number().int().optional().nullable(),
});

export const updateUserSchema = createUserSchema.partial();

export const userIdParamSchema = z.object({
  id: z.string().uuid("id must be a UUID"),
});

export const queryUserSchema = z.object({
  email: z.string().email().optional(),
});
