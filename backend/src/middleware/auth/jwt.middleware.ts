import { Response, NextFunction } from "express";
import { auth } from "../../config/firebase";
import { AuthRequest, AuthPayload } from "../../types/auth.types";

/**
 * Middleware to verify Firebase JWT (ID Token).
 * 
 * @param requiredScopes Optional array of scopes required to access the endpoint
 */
export const jwtAuth = (requiredScopes: string[] = []) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Enforce HTTPS in production behind API gateway
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

      // 2. Set Cache-Control headers for auth responses
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      // 3. Extract the token from Authorization header
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

      // 4. Verify Firebase ID Token and check for revocation
      // The second argument `true` enforces checking if the token has been revoked
      const decodedToken = await auth.verifyIdToken(token, true);

      // 5. Map claims to AuthPayload
      const userScopes = decodedToken.scopes || [];
      const userPayload: AuthPayload = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        scopes: userScopes,
        providerId: decodedToken.firebase.sign_in_provider,
      };

      // 6. Verify Scopes
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

      // 7. Attach to request and continue
      req.user = userPayload;
      next();
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      // Clean up sensitive data before logging
      const errorMessage = err?.message || "Unknown error";
      const errorCode = err?.code || "auth/unknown-error";

      // Log authentication failure using standard error output
      console.warn(`[Auth Warning] JWT verification failed: ${errorCode} - ${errorMessage}`);

      // Map Firebase error codes to consistent user-facing messages
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
