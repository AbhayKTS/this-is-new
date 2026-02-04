import { z } from "zod";

export const collegeIdParamSchema = z.object({
  id: z.string().uuid("id must be a UUID"),
});

export const submitRatingSchema = z.object({
  user_id: z.string().uuid("user_id must be a UUID"),
  academics: z.number().min(1).max(5),
  placements: z.number().min(1).max(5),
  hostel: z.number().min(1).max(5),
  campus_culture: z.number().min(1).max(5),
  infrastructure: z.number().min(1).max(5),
  value_for_money: z.number().min(1).max(5),
  review_text: z.string().max(2000).optional(),
});

export const searchCollegeSchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const compareCollegesSchema = z.object({
  ids: z.string().refine(
    (val) => {
      const ids = val.split(",");
      return ids.length >= 2 && ids.length <= 5;
    },
    { message: "Provide 2-5 comma-separated college IDs" }
  ),
});
