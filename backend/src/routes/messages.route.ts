import { Router } from "express";
import { MessageController } from "../controllers/message.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, MessageController.getUserMessages);

export default router;
