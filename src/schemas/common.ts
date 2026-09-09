import { z } from "zod";

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Must be a valid MongoDB ObjectId");

export const idParamsSchema = z.object({
  id: objectIdSchema,
});

export const emptyQuerySchema = z.object({}).strict();

export function atLeastOneField<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });
}
