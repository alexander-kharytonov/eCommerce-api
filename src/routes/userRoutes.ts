import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser,
} from "../controllers";
import { asyncHandler, validate } from "../middleware";
import {
  createUserSchema,
  emptyQuerySchema,
  idParamsSchema,
  updateUserSchema,
} from "../schemas";

export const userRouter = Router();

userRouter
  .route("/")
  .get(validate({ query: emptyQuerySchema }), asyncHandler(listUsers))
  .post(validate({ body: createUserSchema }), asyncHandler(createUser));

userRouter
  .route("/:id")
  .get(validate({ params: idParamsSchema }), asyncHandler(getUser))
  .put(validate({ params: idParamsSchema, body: updateUserSchema }), asyncHandler(updateUser))
  .delete(validate({ params: idParamsSchema }), asyncHandler(deleteUser));
