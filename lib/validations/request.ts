import { z } from "zod";

export const requestSchema = z.object({
  name: z
    .string()
    .min(3, "Request name must be at least 3 characters")
    .max(50, "Request name cannot exceed 50 characters"),
    method: z.enum(["GET", "POST", "PUT", "DELETE","PATCH", "OPTIONS", "HEAD"]),
    url: z.string().url("Invalid URL format"),
    headers: z.record(z.string(), z.string()).optional(),
    body: z.any().optional(),
    collectionId: z.number().int().positive(),
});