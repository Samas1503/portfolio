import { schemas } from "@/backend/data/schemas";
import { z } from "zod";

// Zod Schemas por método
export const commonParams = z.object({
  id: z.coerce.number().int().positive(),
});

export const commonQuery = z.object({
  tipo: z.enum(Object.keys(schemas) as [keyof typeof schemas]),
});
