import { z } from "zod";
import { atLeastOneField, objectIdSchema } from "./common";

const productNameSchema = z.string().trim().min(1, "Name is required").max(200);
const descriptionSchema = z.string().trim().min(1, "Description is required").max(5_000);
const priceSchema = z.number().finite().min(0, "Price cannot be negative");

export const createProductSchema = z.object({
  name: productNameSchema,
  description: descriptionSchema,
  price: priceSchema,
  categoryId: objectIdSchema,
});

export const updateProductSchema = atLeastOneField(
  z.object({
    name: productNameSchema.optional(),
    description: descriptionSchema.optional(),
    price: priceSchema.optional(),
    categoryId: objectIdSchema.optional(),
  }),
);

export const listProductsQuerySchema = z
  .object({
    categoryId: objectIdSchema.optional(),
  })
  .strict();

export type CreateProductBody = z.infer<typeof createProductSchema>;
export type UpdateProductBody = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
