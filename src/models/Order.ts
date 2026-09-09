import { Schema, model, type InferSchemaType } from "mongoose";
import { responseOptions } from "./transform";

const orderProductSchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: false,
  },
);

const orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    products: {
      type: [orderProductSchema],
      required: true,
      validate: {
        validator: (products: unknown[]) => products.length > 0,
        message: "An order must contain at least one product",
      },
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: responseOptions,
    toObject: responseOptions,
  },
);

orderSchema.index({ "products.productId": 1 });

export type Order = InferSchemaType<typeof orderSchema>;

export const OrderModel = model<Order>("Order", orderSchema);
