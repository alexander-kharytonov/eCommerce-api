import type { Request, Response } from "express";
import { ApiError } from "../errors/ApiError";
import { CategoryModel } from "../models";
import type { CreateCategoryBody, UpdateCategoryBody } from "../schemas";

interface IdParams {
  id: string;
}

export async function listCategories(_request: Request, response: Response): Promise<void> {
  const categories = await CategoryModel.find().sort({ createdAt: -1 }).exec();
  response.json(categories);
}

export async function createCategory(request: Request, response: Response): Promise<void> {
  const body = request.validated?.body as CreateCategoryBody;
  const category = await CategoryModel.create(body);
  response.location(`/categories/${category.id}`).status(201).json(category);
}

export async function getCategory(request: Request, response: Response): Promise<void> {
  const { id } = request.validated?.params as IdParams;
  const category = await CategoryModel.findById(id).exec();

  if (!category) {
    throw ApiError.notFound("Category");
  }

  response.json(category);
}

export async function updateCategory(request: Request, response: Response): Promise<void> {
  const { id } = request.validated?.params as IdParams;
  const body = request.validated?.body as UpdateCategoryBody;
  const category = await CategoryModel.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  }).exec();

  if (!category) {
    throw ApiError.notFound("Category");
  }

  response.json(category);
}

export async function deleteCategory(request: Request, response: Response): Promise<void> {
  const { id } = request.validated?.params as IdParams;
  const category = await CategoryModel.findByIdAndDelete(id).exec();

  if (!category) {
    throw ApiError.notFound("Category");
  }

  response.status(204).send();
}
