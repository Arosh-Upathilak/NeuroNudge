/// <reference types="jest" />
import { Request, Response, NextFunction } from "express";
import { AppError, errorHandler } from "../error.middleware";

describe("Error Middleware", () => {
  describe("AppError", () => {
    it("should instantiate with correct properties and default status/code", () => {
      const error = new AppError("Test error message");

      expect(error.message).toBe("Test error message");
      expect(error.status).toBe(500);
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(Error);
    });

    it("should instantiate with custom status and error code", () => {
      const error = new AppError("Custom error", 400, "BAD_REQUEST");

      expect(error.message).toBe("Custom error");
      expect(error.status).toBe(400);
      expect(error.code).toBe("BAD_REQUEST");
    });
  });

  describe("errorHandler", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;
    let consoleErrorSpy: jest.SpyInstance;
    let originalNodeEnv: string | undefined;

    beforeEach(() => {
      originalNodeEnv = process.env.NODE_ENV;
      mockRequest = {};
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      nextFunction = jest.fn();
      consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
      consoleErrorSpy.mockRestore();
    });

    it("should handle standard AppError and return formatted response", () => {
      const err = new AppError("Bad request error", 400, "BAD_REQUEST");

      errorHandler(err, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Bad request error",
        },
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[Error Handler] [BAD_REQUEST] 400 - Bad request error"
      );
    });

    it("should handle plain Error and return default 500 error response", () => {
      const err = new Error("Generic database error");

      errorHandler(err, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Generic database error",
        },
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[Error Handler] [INTERNAL_SERVER_ERROR] 500 - Generic database error"
      );
    });

    it("should use fallback values if error lacks message", () => {
      const err = { status: 403, code: "FORBIDDEN" } as unknown as Error;

      errorHandler(err, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "An unexpected error occurred",
        },
      });
    });

    it("should print stack trace in non-production environments", () => {
      process.env.NODE_ENV = "development";
      const err = new Error("Dev error");

      errorHandler(err, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2); // 1 for custom log, 1 for stack trace
      expect(consoleErrorSpy).toHaveBeenLastCalledWith(err.stack);
    });

    it("should NOT print stack trace in production environment", () => {
      process.env.NODE_ENV = "production";
      const err = new Error("Prod error");

      errorHandler(err, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1); // Only custom log, no stack trace
      expect(consoleErrorSpy).not.toHaveBeenLastCalledWith(err.stack);
    });
  });
});
