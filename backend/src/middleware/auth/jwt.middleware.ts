import { Response, NextFunction } from "express";
import { auth } from "../../config/firebase";
import { AuthRequest, AuthPayload } from "../../types/auth.types";

/**
 * Middleware to verify Firebase ID tokens (JWTs) and check scope permissions.
 */
export const jwtAuth = (requiredScopes: string[] = []) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (
        process.env.NODE_ENV === "production" &&
        !req.secure &&
        req.get("x-forwarded-proto") !== "https"
      ) {
        res.status(403).json({
          success: false,
          error: {
            code: "HTTPS_REQUIRED",
            message: "HTTPS is required for all API gateway requests",
          },
        });
        return;
      }

      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Access token is missing or malformed",
          },
        });
        return;
      }

      const token = authHeader.split(" ")[1];

      const decodedToken = await auth.verifyIdToken(token, true);
      const userScopes = decodedToken.scopes || [];
      const userPayload: AuthPayload = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        scopes: userScopes,
        providerId: decodedToken.firebase.sign_in_provider,
      };

      if (requiredScopes.length > 0) {
        const hasAllScopes = requiredScopes.every((scope) => userScopes.includes(scope));
        if (!hasAllScopes) {
          res.status(403).json({
            success: false,
            error: {
              code: "FORBIDDEN",
              message: "Insufficient permissions to access this resource",
            },
          });
          return;
        }
      }

      req.user = userPayload;
      next();
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      const errorMessage = err?.message || "Unknown error";
      const errorCode = err?.code || "auth/unknown-error";

      console.warn(`[Auth Warning] JWT verification failed: ${errorCode} - ${errorMessage}`);
      const status = 401;
      let userMessage = "Authentication failed";
      let userCode = "UNAUTHORIZED";

      if (errorCode === "auth/id-token-expired") {
        userMessage = "Firebase ID token has expired";
        userCode = "TOKEN_EXPIRED";
      } else if (errorCode === "auth/id-token-revoked") {
        userMessage = "Firebase ID token has been revoked";
        userCode = "TOKEN_REVOKED";
      } else if (errorCode === "auth/argument-error") {
        userMessage = "Invalid token format";
        userCode = "INVALID_TOKEN";
      }

      res.status(status).json({
        success: false,
        error: {
          code: userCode,
          message: userMessage,
        },
      });
    }
  };
};
