/**
 * Express router defining endpoints for user profiles, login, and registration.
 */
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { syncUser, getUserProfile } from "../controllers/user.controller";

const router = Router();

router.post("/sync", authMiddleware, syncUser);
router.get("/profile", authMiddleware, getUserProfile);

export default router;

