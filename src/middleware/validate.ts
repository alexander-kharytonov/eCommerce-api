import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";
import { ApiError } from "../errors/ApiError";

interface RequestSchemas {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
}

export function validate(schemas: RequestSchemas): RequestHandler {
  return (request, _response, next) => {
    const parsed: Record<string, unknown> = {};

    for (const key of ["params", "query", "body"] as const) {
      const schema = schemas[key];
      if (!schema) continue;

      const result = schema.safeParse(request[key]);
      if (!result.success) {
        const details = result.error.issues.map((issue) => ({
          path: [key, ...issue.path].join("."),
          message: issue.message,
          code: issue.code,
        }));

        next(ApiError.badRequest("Request validation failed", "VALIDATION_ERROR", details));
        return;
      }

      parsed[key] = result.data;
    }

    request.validated = parsed;
    next();
  };
}
