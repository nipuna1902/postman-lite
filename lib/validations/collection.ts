import { z } from "zod";

export const collectionSchema = z.object({
  name: z
    .string()
    .min(3, "Collection name must be at least 3 characters")
    .max(50, "Collection name cannot exceed 50 characters"),
    workspaceId: z.number().int().positive(),
});