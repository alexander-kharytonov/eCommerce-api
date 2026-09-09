import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from "../controllers";
import { asyncHandler, validate } from "../middleware";
import {
  createProductSchema,
  idParamsSchema,
  listProductsQuerySchema,
  updateProductSchema,
} from "../schemas";

export const productRouter = Router();

productRouter
  .route("/")
  .get(validate({ query: listProductsQuerySchema }), asyncHandler(listProducts))
  .post(validate({ body: createProductSchema }), asyncHandler(createProduct));

productRouter
  .route("/:id")
  .get(validate({ params: idParamsSchema }), asyncHandler(getProduct))
  .put(
    validate({ params: idParamsSchema, body: updateProductSchema }),
    asyncHandler(updateProduct),
  )
  .delete(validate({ params: idParamsSchema }), asyncHandler(deleteProduct));
