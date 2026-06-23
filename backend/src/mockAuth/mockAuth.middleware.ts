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
    uid: "93bd488e-5a27-43b8-9668-0f9c7485d988",
    email: "dev@test.com",
    name: "Dev User",
    providerId: "mock",
    scopes: ["*"],
  };

  req.user = mockUser;

  next();
};