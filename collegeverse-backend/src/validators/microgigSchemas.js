import { z } from "zod";

export const createMicrogigSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  reward_points: z.number().int().nonnegative(),
  deadline: z.string().optional(),
});

export const applyMicrogigSchema = z.object({
  user_id: z.string().uuid(),
  pitch: z.string().min(5),
});

export const updateMicrogigStatusSchema = z.object({
  status: z.enum(["open", "assigned", "completed", "approved", "rejected"]),
});

export const microgigIdParamSchema = z.object({ id: z.string().uuid() });
