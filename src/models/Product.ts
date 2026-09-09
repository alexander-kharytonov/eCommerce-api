import { Schema, model, type InferSchemaType } from "mongoose";
import { responseOptions } from "./transform";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: responseOptions,
    toObject: responseOptions,
  },
);

export type Product = InferSchemaType<typeof productSchema>;

export const ProductModel = model<Product>("Product", productSchema);
