/**
 * Express router defining endpoints for user profiles, login, and registration.
 */
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { syncUser, getUserProfile, sendVerification, forgotPassword } from "../controllers/user.controller";

const router = Router();

router.post("/sync", authMiddleware, syncUser);
router.get("/profile", authMiddleware, getUserProfile);
router.post("/send-verification", authMiddleware, sendVerification);
router.post("/forgot-password", forgotPassword);

export default router;

