import { Response, NextFunction } from "express";
import { auth } from "../../config/firebase";
import { AuthRequest, AuthPayload } from "../../types/auth.types";

/**
 * Helper to check if a string matches a basic JWT format (3 dot-separated parts).
 */
const isJwt = (token: string): boolean => {
  return token.split(".").length === 3;
};

/**
 * Middleware to validate third-party OAuth tokens (Google, Facebook) via Firebase.
 * 
 * @param requiredScopes Optional array of scopes required to access the endpoint
 */
export const oauthAuth = (requiredScopes: string[] = []) => {
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

      // 3. Extract authorization token
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

      // 4. Extract and validate provider from custom header
      const providerId = req.headers["x-oauth-provider"] as string;
      if (!providerId) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing 'x-oauth-provider' header for OAuth flow",
          },
        });
        return;
      }

      const webApiKey = process.env.FIREBASE_WEB_API_KEY;
      if (!webApiKey && process.env.NODE_ENV !== "test") {
        console.error("❌ Firebase Web API Key (FIREBASE_WEB_API_KEY) is not configured in .env");
        res.status(500).json({
          success: false,
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "OAuth gateway is misconfigured",
          },
        });
        return;
      }

      // 5. Construct postBody based on provider and token type
      let postBody = "";
      if (providerId === "google.com") {
        if (isJwt(token)) {
          postBody = `id_token=${encodeURIComponent(token)}&providerId=google.com`;
        } else {
          postBody = `access_token=${encodeURIComponent(token)}&providerId=google.com`;
        }
      } else {
        // Facebook and other providers typically use access_token
        postBody = `access_token=${encodeURIComponent(token)}&providerId=${encodeURIComponent(providerId)}`;
      }

      // 6. Call Firebase REST API to exchange OAuth token for Firebase ID token
      const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${webApiKey || "dummy-key"}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postBody,
          requestUri: "http://localhost",
          returnSecureToken: true,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMessage = errData?.error?.message || "Failed to exchange OAuth token";
        console.warn(`[Auth Warning] OAuth token exchange failed: ${errMessage}`);
        res.status(401).json({
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Third-party token exchange failed",
          },
        });
        return;
      }

      const data = await response.json();
      const firebaseIdToken = data.idToken;

      if (!firebaseIdToken) {
        res.status(401).json({
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "No ID token returned from Firebase",
          },
        });
        return;
      }

      // 7. Verify the returned Firebase ID Token using Admin SDK
      const decodedToken = await auth.verifyIdToken(firebaseIdToken, true);

      // 8. Map claims to AuthPayload
      const userScopes = decodedToken.scopes || [];
      const userPayload: AuthPayload = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        scopes: userScopes,
        providerId: decodedToken.firebase.sign_in_provider,
      };

      // 9. Verify Scopes
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

      // 10. Attach to request and continue
      req.user = userPayload;
      next();
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.warn(`[Auth Warning] OAuth validation exception: ${err?.message || error}`);
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Third-party authentication failed",
        },
      });
    }
  };
};
