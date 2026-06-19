import { Request, Response, NextFunction } from "express";

/**
 * Custom Error class that supports status codes and error keys
 */
export class AppError extends Error {
  public status: number;
  public code: string;

  constructor(message: string, status: number = 500, code: string = "INTERNAL_SERVER_ERROR") {
    super(message);
    this.status = status;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Centralized error handling middleware.
 * Standardizes all error responses across the backend application.
 */
export const errorHandler = (
  err: Error & { status?: number; code?: string },
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const status = err.status || 500;
  const code = err.code || "INTERNAL_SERVER_ERROR";
  const message = err.message || "An unexpected error occurred";

  // Log the failure using console.error (safely without leaking token data)
  console.error(`[Error Handler] [${code}] ${status} - ${message}`);
  
  if (err.stack && process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  res.status(status).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};
