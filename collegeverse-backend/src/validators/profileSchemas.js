import { z } from "zod";

export const profileUpsertSchema = z.object({
  user_id: z.string().uuid(),
  bio: z.string().max(500).optional().nullable(),
  skills: z.array(z.string()).optional().default([]),
  interests: z.array(z.string()).optional().default([]),
  graduation_year: z.number().int().optional().nullable(),
  resume_url: z.string().url().optional().nullable(),
  github_username: z.string().optional().nullable(),
});
