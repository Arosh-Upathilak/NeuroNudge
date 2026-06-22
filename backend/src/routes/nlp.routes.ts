import { Router } from "express";
import { NLPController } from "../controllers/nlp.controller";
import { mockAuth } from "../mockAuth/mockAuth.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();



router.post(
  "/chat",
  mockAuth,
  upload.single("image"),
  NLPController.processMessage.bind(NLPController)
);

export default router;