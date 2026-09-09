import type { Request, Response } from "express";
import { ApiError } from "../errors/ApiError";
import { UserModel } from "../models";
import type { CreateUserBody, UpdateUserBody } from "../schemas";

interface IdParams {
  id: string;
}

export async function listUsers(_request: Request, response: Response): Promise<void> {
  const users = await UserModel.find().select("-password").sort({ createdAt: -1 }).exec();
  response.json(users);
}

export async function createUser(request: Request, response: Response): Promise<void> {
  const body = request.validated?.body as CreateUserBody;
  const existingUser = await UserModel.exists({ email: body.email });

  if (existingUser) {
    throw ApiError.conflict("A user with that email already exists", { field: "email" });
  }

  const user = await UserModel.create(body);
  response.location(`/users/${user.id}`).status(201).json(user);
}

export async function getUser(request: Request, response: Response): Promise<void> {
  const { id } = request.validated?.params as IdParams;
  const user = await UserModel.findById(id).select("-password").exec();

  if (!user) {
    throw ApiError.notFound("User");
  }

  response.json(user);
}

export async function updateUser(request: Request, response: Response): Promise<void> {
  const { id } = request.validated?.params as IdParams;
  const body = request.validated?.body as UpdateUserBody;
  const user = await UserModel.findById(id).select("+password").exec();

  if (!user) {
    throw ApiError.notFound("User");
  }

  if (body.email) {
    const existingUser = await UserModel.exists({
      email: body.email,
      _id: { $ne: id },
    });

    if (existingUser) {
      throw ApiError.conflict("A user with that email already exists", { field: "email" });
    }
  }

  user.set(body);
  await user.save();
  response.json(user);
}

export async function deleteUser(request: Request, response: Response): Promise<void> {
  const { id } = request.validated?.params as IdParams;
  const user = await UserModel.findByIdAndDelete(id).exec();

  if (!user) {
    throw ApiError.notFound("User");
  }

  response.status(204).send();
}
