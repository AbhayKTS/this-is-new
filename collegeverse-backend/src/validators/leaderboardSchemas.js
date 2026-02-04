import { z } from "zod";

export const leaderboardQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const upsertLeaderboardSchema = z.object({
  user_id: z.string().uuid(),
  score: z.number().finite().nonnegative(),
});
