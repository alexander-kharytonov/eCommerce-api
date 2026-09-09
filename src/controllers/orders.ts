import type { Request, Response } from "express";
import { ApiError } from "../errors/ApiError";
import { OrderModel, ProductModel, UserModel } from "../models";
import type { CreateOrderBody, UpdateOrderBody } from "../schemas";
import {
  calculateOrderTotal,
  MAX_ORDER_TOTAL,
  OrderTotalOutOfRangeError,
} from "../services/orderPricing";
import type { OrderProductInput } from "../types";

interface IdParams {
  id: string;
}

interface PreparedOrder {
  userId: string;
  products: OrderProductInput[];
  total: number;
}

async function prepareOrder(userId: string, products: OrderProductInput[]): Promise<PreparedOrder> {
  const uniqueProductIds = [...new Set(products.map((product) => product.productId))];
  const [userExists, storedProducts] = await Promise.all([
    UserModel.exists({ _id: userId }),
    ProductModel.find({ _id: { $in: uniqueProductIds } }).select("_id price").lean().exec(),
  ]);

  if (!userExists) {
    throw ApiError.unprocessable("The referenced user does not exist", "USER_NOT_FOUND", {
      userId,
    });
  }

  const pricesByProductId = new Map(
    storedProducts.map((product) => [String(product._id), product.price]),
  );
  const missingProductIds = uniqueProductIds.filter(
    (productId) => !pricesByProductId.has(productId),
  );

  if (missingProductIds.length > 0) {
    throw ApiError.unprocessable(
      "One or more referenced products do not exist",
      "PRODUCT_NOT_FOUND",
      { productIds: missingProductIds },
    );
  }

  try {
    return {
      userId,
      products,
      total: calculateOrderTotal(products, pricesByProductId),
    };
  } catch (error) {
    if (error instanceof OrderTotalOutOfRangeError) {
      throw ApiError.unprocessable(
        "Calculated order total exceeds the supported maximum",
        "ORDER_TOTAL_OUT_OF_RANGE",
        { maxTotal: MAX_ORDER_TOTAL },
      );
    }

    throw error;
  }
}

export async function listOrders(_request: Request, response: Response): Promise<void> {
  const orders = await OrderModel.find().sort({ createdAt: -1 }).exec();
  response.json(orders);
}

export async function createOrder(request: Request, response: Response): Promise<void> {
  const body = request.validated?.body as CreateOrderBody;
  const preparedOrder = await prepareOrder(body.userId, body.products);
  const order = await OrderModel.create(preparedOrder);

  response.location(`/orders/${order.id}`).status(201).json(order);
}

export async function getOrder(request: Request, response: Response): Promise<void> {
  const { id } = request.validated?.params as IdParams;
  const order = await OrderModel.findById(id).exec();

  if (!order) {
    throw ApiError.notFound("Order");
  }

  response.json(order);
}

export async function updateOrder(request: Request, response: Response): Promise<void> {
  const { id } = request.validated?.params as IdParams;
  const body = request.validated?.body as UpdateOrderBody;
  const order = await OrderModel.findById(id).exec();

  if (!order) {
    throw ApiError.notFound("Order");
  }

  const userId = body.userId ?? String(order.userId);
  const products =
    body.products ??
    order.products.map((product) => ({
      productId: String(product.productId),
      quantity: product.quantity,
    }));
  const preparedOrder = await prepareOrder(userId, products);

  order.set(preparedOrder);
  await order.save();
  response.json(order);
}

export async function deleteOrder(request: Request, response: Response): Promise<void> {
  const { id } = request.validated?.params as IdParams;
  const order = await OrderModel.findByIdAndDelete(id).exec();

  if (!order) {
    throw ApiError.notFound("Order");
  }

  response.status(204).send();
}
