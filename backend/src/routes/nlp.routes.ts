import { Router } from "express";
import { NLPController } from "../controllers/nlp.controller";

import { upload } from "../middleware/upload.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import {mockAuth} from "../mockAuth/mockAuth.middleware";
const router = Router();
const auth =mockAuth; // Use mockAuth for development/testing
router.post(
  "/chat",
  auth,
  upload.single("image"),
  NLPController.processMessage.bind(NLPController)
);

export default router;