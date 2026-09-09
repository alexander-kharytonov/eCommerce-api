import { z } from "zod";
import { atLeastOneField, objectIdSchema } from "./common";

export const orderProductSchema = z.object({
  productId: objectIdSchema,
  quantity: z.number().int().positive("Quantity must be greater than zero"),
});

export const createOrderSchema = z.object({
  userId: objectIdSchema,
  products: z.array(orderProductSchema).min(1, "At least one product is required"),
});

export const updateOrderSchema = atLeastOneField(
  z.object({
    userId: objectIdSchema.optional(),
    products: z.array(orderProductSchema).min(1, "At least one product is required").optional(),
  }),
);

export type CreateOrderBody = z.infer<typeof createOrderSchema>;
export type UpdateOrderBody = z.infer<typeof updateOrderSchema>;
