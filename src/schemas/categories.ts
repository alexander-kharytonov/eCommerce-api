import { z } from "zod";
import { atLeastOneField } from "./common";

const categoryNameSchema = z.string().trim().min(1, "Name is required").max(120);

export const createCategorySchema = z.object({
  name: categoryNameSchema,
});

export const updateCategorySchema = atLeastOneField(
  z.object({
    name: categoryNameSchema.optional(),
  }),
);

export type CreateCategoryBody = z.infer<typeof createCategorySchema>;
export type UpdateCategoryBody = z.infer<typeof updateCategorySchema>;
