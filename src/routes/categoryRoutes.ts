import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory,
} from "../controllers";
import { asyncHandler, validate } from "../middleware";
import {
  createCategorySchema,
  emptyQuerySchema,
  idParamsSchema,
  updateCategorySchema,
} from "../schemas";

export const categoryRouter = Router();

categoryRouter
  .route("/")
  .get(validate({ query: emptyQuerySchema }), asyncHandler(listCategories))
  .post(validate({ body: createCategorySchema }), asyncHandler(createCategory));

categoryRouter
  .route("/:id")
  .get(validate({ params: idParamsSchema }), asyncHandler(getCategory))
  .put(
    validate({ params: idParamsSchema, body: updateCategorySchema }),
    asyncHandler(updateCategory),
  )
  .delete(validate({ params: idParamsSchema }), asyncHandler(deleteCategory));
