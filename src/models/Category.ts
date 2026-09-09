import { Schema, model, type InferSchemaType } from "mongoose";
import { responseOptions } from "./transform";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: responseOptions,
    toObject: responseOptions,
  },
);

export type Category = InferSchemaType<typeof categorySchema>;

export const CategoryModel = model<Category>("Category", categorySchema);
