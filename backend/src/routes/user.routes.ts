/**
 * Express router defining endpoints for user profiles, login, and registration.
 */
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { registerUser, loginUser, getUserProfile } from "../controllers/user.controller";

const router = Router();

router.post("/register", authMiddleware, registerUser);
router.post("/login", authMiddleware, loginUser);
router.get("/profile", authMiddleware, getUserProfile);

export default router;

