import { z } from "zod";

export const githubSyncSchema = z.object({
  user_id: z.string().uuid(),
  github_username: z.string().min(1),
});
