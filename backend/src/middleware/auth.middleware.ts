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

  const token = authHeader.slice(7).trim();

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication failed: Token is empty",
      },
    });
    return;
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userScopes = (decodedToken.scopes as string[]) || [];

    const userPayload: AuthPayload = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified || false,
      name: decodedToken.name,
      scopes: userScopes,
      providerId: decodedToken.firebase.sign_in_provider,
    };

    req.user = userPayload;
    return next();
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.warn(`[Auth Warning] Verification failed: ${errMsg}`);

    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication failed: Invalid or expired token",
      },
    });
  }
};
