import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { ApiError } from "../errors/ApiError";

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

function isDuplicateKeyError(error: unknown): error is { code: number; keyValue?: unknown } {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

function isJsonSyntaxError(error: unknown): error is SyntaxError & { status: number } {
  return error instanceof SyntaxError && "status" in error && error.status === 400;
}

function getHttpStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;

  if ("status" in error && typeof error.status === "number") {
    return error.status;
  }

  if ("statusCode" in error && typeof error.statusCode === "number") {
    return error.statusCode;
  }

  return undefined;
}

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  let apiError: ApiError;
  const httpStatus = getHttpStatus(error);

  if (error instanceof ApiError) {
    apiError = error;
  } else if (error instanceof mongoose.Error.CastError) {
    apiError = ApiError.badRequest("Invalid identifier", "INVALID_ID", {
      path: error.path,
      value: error.value,
    });
  } else if (error instanceof mongoose.Error.ValidationError) {
    apiError = ApiError.badRequest(
      "Database validation failed",
      "DATABASE_VALIDATION_ERROR",
      Object.values(error.errors).map((validationError) => ({
        path: validationError.path,
        message: validationError.message,
      })),
    );
  } else if (isDuplicateKeyError(error)) {
    apiError = ApiError.conflict("A resource with that unique value already exists", error.keyValue);
  } else if (isJsonSyntaxError(error)) {
    apiError = ApiError.badRequest("Malformed JSON request body", "INVALID_JSON");
  } else if (httpStatus === 413) {
    apiError = new ApiError(413, "PAYLOAD_TOO_LARGE", "Request body exceeds the 1 MB limit");
  } else if (httpStatus === 415) {
    apiError = new ApiError(
      415,
      "UNSUPPORTED_MEDIA_TYPE",
      "Request body encoding or charset is not supported",
    );
  } else {
    apiError = new ApiError(500, "INTERNAL_SERVER_ERROR", "An unexpected error occurred");
    console.error(error);
  }

  const body: ErrorResponse = {
    error: {
      code: apiError.code,
      message: apiError.message,
    },
  };

  if (apiError.details !== undefined) {
    body.error.details = apiError.details;
  }

  response.status(apiError.statusCode).json(body);
};
