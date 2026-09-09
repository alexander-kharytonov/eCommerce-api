export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(message: string, code = "BAD_REQUEST", details?: unknown): ApiError {
    return new ApiError(400, code, message, details);
  }

  static notFound(resource: string): ApiError {
    return new ApiError(404, "NOT_FOUND", `${resource} not found`);
  }

  static conflict(message: string, details?: unknown): ApiError {
    return new ApiError(409, "CONFLICT", message, details);
  }

  static unprocessable(message: string, code = "UNPROCESSABLE_ENTITY", details?: unknown): ApiError {
    return new ApiError(422, code, message, details);
  }
}
