import { Router } from "express";
import {
  createOrder,
  deleteOrder,
  getOrder,
  listOrders,
  updateOrder,
} from "../controllers";
import { asyncHandler, validate } from "../middleware";
import {
  createOrderSchema,
  emptyQuerySchema,
  idParamsSchema,
  updateOrderSchema,
} from "../schemas";

export const orderRouter = Router();

orderRouter
  .route("/")
  .get(validate({ query: emptyQuerySchema }), asyncHandler(listOrders))
  .post(validate({ body: createOrderSchema }), asyncHandler(createOrder));

orderRouter
  .route("/:id")
  .get(validate({ params: idParamsSchema }), asyncHandler(getOrder))
  .put(validate({ params: idParamsSchema, body: updateOrderSchema }), asyncHandler(updateOrder))
  .delete(validate({ params: idParamsSchema }), asyncHandler(deleteOrder));
