import { z } from "zod";

export const submitVerificationSchema = z.object({
  user_id: z.string().uuid("user_id must be a UUID"),
  college_id: z.string().uuid("college_id must be a UUID").optional(),
  college_name: z.string().min(2).max(200),
  graduation_year: z.number().int().min(2000).max(2030),
  id_proof_url: z.string().url("id_proof_url must be a valid URL"),
  student_email: z.string().email("student_email must be a valid email"),
});

export const updateVerificationSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  reviewer_notes: z.string().max(1000).optional(),
});

export const verificationIdParamSchema = z.object({
  id: z.string().uuid("id must be a UUID"),
});
