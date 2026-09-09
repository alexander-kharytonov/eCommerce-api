import { z } from "zod";
import { atLeastOneField } from "./common";

const nameSchema = z.string().trim().min(1, "Name is required").max(120);
const emailSchema = z
  .string()
  .trim()
  .email("A valid email is required")
  .max(254)
  .transform((email) => email.toLowerCase());
const passwordSchema = z.string().min(1, "Password is required").max(200);

export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const updateUserSchema = atLeastOneField(
  z.object({
    name: nameSchema.optional(),
    email: emailSchema.optional(),
    password: passwordSchema.optional(),
  }),
);

export type CreateUserBody = z.infer<typeof createUserSchema>;
export type UpdateUserBody = z.infer<typeof updateUserSchema>;
