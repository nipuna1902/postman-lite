import { z } from "zod";

export const environmentSchema = z.object({
  name: z
    .string()
    .min(3, "Environment name must be at least 3 characters")
    .max(50, "Environment name cannot exceed 50 characters"),
  workspaceId: z.number().int().positive(),
  variables: z.record(z.string(), z.string()).optional(),
});