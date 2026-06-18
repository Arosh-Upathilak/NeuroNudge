import { Router } from "express";
import { UploadController } from "../controllers/object.controller";
import { upload } from "../middleware/upload.middleware";

const router = Router();
const uploadController = new UploadController();

router.post(
  "/upload",
  upload.single("image"),
  uploadController.uploadImage
);

export default router;