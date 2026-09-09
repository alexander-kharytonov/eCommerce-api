import type { RequestHandler } from "express";
import { ApiError } from "../errors/ApiError";

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(new ApiError(404, "ROUTE_NOT_FOUND", `Route ${request.method} ${request.originalUrl} not found`));
};
