import { z } from "zod";

export const createCertificateSchema = z.object({
  user_id: z.string().uuid(),
  title: z.string().min(2).max(180),
  issuer: z.string().min(2).max(180),
  issued_at: z.string().optional(),
  file_name: z.string().min(3),
  file_base64: z.string().min(10),
  mime_type: z.string().optional().default("application/octet-stream"),
});

export const verifyCertificateSchema = z.object({
  status: z.enum(["pending", "verified", "rejected"]),
  reviewer: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const certificateIdParamSchema = z.object({
  id: z.string().uuid(),
});
