import { Router, Response } from "express";
import { apiGatewayAuth, appCheck } from "../middleware/auth";
import { AuthRequest } from "../types/auth.types";

const router = Router();

/**
 * @openapi
 * /api/protected/profile:
 *   get:
 *     summary: Retrieve user profile
 *     description: Requires valid App Check token and Firebase ID token.
 */
router.get("/profile", appCheck, apiGatewayAuth(), (req: AuthRequest, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Profile retrieved successfully",
    user: req.user,
  });
});

/**
 * @openapi
 * /api/protected/admin:
 *   get:
 *     summary: Retrieve admin panel context
 *     description: Requires valid App Check token and Firebase token with 'admin' scope.
 */
router.get("/admin", appCheck, apiGatewayAuth(["admin"]), (req: AuthRequest, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the admin dashboard",
    user: req.user,
  });
});

export default router;
