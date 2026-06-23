import { Router } from "express";
import { MessageController } from "../controllers/message.controller";
import { mockAuth } from "../mockAuth/mockAuth.middleware";


const router = Router();



router.get(
  "/",
  mockAuth,
  MessageController.getUserMessages
);

export default router;