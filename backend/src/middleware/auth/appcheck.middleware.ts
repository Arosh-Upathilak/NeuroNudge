import { Request, Response, NextFunction } from "express";
import { getAppCheck } from "firebase-admin/app-check";

/**
 * Middleware to verify Firebase App Check tokens for client attestation.
 */
export const appCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const appCheckToken = req.headers["x-firebase-appcheck"] as string;
    if (!appCheckToken) {
      res.status(401).json({
        success: false,
        error: {
          code: "APP_CHECK_MISSING",
          message: "App Check token is missing",
        },
      });
      return;
    }

    const bypassToken = process.env.APP_CHECK_BYPASS_TOKEN;
    if (
      process.env.NODE_ENV !== "production" &&
      bypassToken &&
      appCheckToken === bypassToken
    ) {
      next();
      return;
    }

    if (process.env.NODE_ENV === "test") {
      next();
      return;
    }

    await getAppCheck().verifyToken(appCheckToken);
    next();
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.warn(`[Auth Warning] App Check verification failed: ${err?.message || error}`);

    res.status(401).json({
      success: false,
      error: {
        code: "APP_CHECK_INVALID",
        message: "App Check token is invalid or expired",
      },
    });
  }
};
