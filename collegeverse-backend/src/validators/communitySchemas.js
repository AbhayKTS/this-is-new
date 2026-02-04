import { z } from "zod";

export const createCommunitySchema = z.object({
  name: z.string().min(3).max(100),
  college_id: z.string().uuid("college_id must be a UUID"),
  description: z.string().max(500).optional(),
  cover_image_url: z.string().url().optional(),
  created_by: z.string().uuid("created_by must be a UUID"),
});

export const joinLeaveCommunitySchema = z.object({
  user_id: z.string().uuid("user_id must be a UUID"),
});

export const communityIdParamSchema = z.object({
  id: z.string().uuid("id must be a UUID"),
});
