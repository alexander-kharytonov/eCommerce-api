import type { Request, Response } from "express";
import { ApiError } from "../errors/ApiError";
import { CategoryModel, ProductModel } from "../models";
import type { CreateProductBody, ListProductsQuery, UpdateProductBody } from "../schemas";

interface IdParams {
  id: string;
}

async function assertCategoryExists(categoryId: string): Promise<void> {
  const category = await CategoryModel.exists({ _id: categoryId });

  if (!category) {
    throw ApiError.unprocessable(
      "The referenced category does not exist",
      "CATEGORY_NOT_FOUND",
      { categoryId },
    );
  }
}

export async function listProducts(request: Request, response: Response): Promise<void> {
  const query = request.validated?.query as ListProductsQuery;
  const filter = query.categoryId ? { categoryId: query.categoryId } : {};
  const products = await ProductModel.find(filter).sort({ createdAt: -1 }).exec();
  response.json(products);
}

export async function createProduct(request: Request, response: Response): Promise<void> {
  const body = request.validated?.body as CreateProductBody;
  await assertCategoryExists(body.categoryId);

  const product = await ProductModel.create(body);
  response.location(`/products/${product.id}`).status(201).json(product);
}

export async function getProduct(request: Request, response: Response): Promise<void> {
  const { id } = request.validated?.params as IdParams;
  const product = await ProductModel.findById(id).exec();

  if (!product) {
    throw ApiError.notFound("Product");
  }

  response.json(product);
}

export async function updateProduct(request: Request, response: Response): Promise<void> {
  const { id } = request.validated?.params as IdParams;
  const body = request.validated?.body as UpdateProductBody;

  if (body.categoryId) {
    await assertCategoryExists(body.categoryId);
  }

  const product = await ProductModel.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  }).exec();

  if (!product) {
    throw ApiError.notFound("Product");
  }

  response.json(product);
}

export async function deleteProduct(request: Request, response: Response): Promise<void> {
  const { id } = request.validated?.params as IdParams;
  const product = await ProductModel.findByIdAndDelete(id).exec();

  if (!product) {
    throw ApiError.notFound("Product");
  }

  response.status(204).send();
}
