import { z } from "zod";

export const workspaceSchema = z.object({
  name: z
    .string()
    .min(3, "Workspace name must be at least 3 characters")
    .max(50, "Workspace name cannot exceed 50 characters"),
});