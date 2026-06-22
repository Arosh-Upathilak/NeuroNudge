import { Response, NextFunction } from "express";
import { auth } from "../config/firebase";
import { AuthRequest, AuthPayload } from "../types/auth.types";

/**
 * Middleware to check the Bearer token from the request header,
 * verify it via Firebase Admin, and attach the user details to the request.
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication failed: Missing or invalid token format",
      },
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userScopes = decodedToken.scopes || [];

    const userPayload: AuthPayload = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      scopes: userScopes,
      providerId: decodedToken.firebase.sign_in_provider,
    };

    req.user = userPayload;
    next();
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    console.warn(`[Auth Warning] Verification failed: ${err?.code || "unknown"} - ${err?.message || error}`);

    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication failed",
      },
    });
  }
};
