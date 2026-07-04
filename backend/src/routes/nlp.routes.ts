import { Router } from "express";
import { NLPController } from "../controllers/nlp.controller";

import { upload } from "../middleware/upload.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/chat",
  authMiddleware,
  upload.single("image"),
  NLPController.processMessage.bind(NLPController),
);

export default router;
