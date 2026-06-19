import { Response, NextFunction } from "express";
import { AuthRequest, AuthPayload } from "../types/auth.types";

/**
 * DEV ONLY: Mock authentication middleware
 * Simulates Firebase/JWT authenticated user
 */
export const mockAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const mockUser: AuthPayload = {
    uid: "87e5b740-23ce-49f1-a620-66cda4c7aa40",
    email: "dev@test.com",
    name: "Dev User",
    providerId: "mock",
    scopes: ["*"],
  };

  req.user = mockUser;

  next();
};