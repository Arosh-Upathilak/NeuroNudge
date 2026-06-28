/**
 * Express router defining endpoints for image file uploading and management.
 */
import { Router } from "express";
import { UploadController } from "../controllers/object.controller";
import { upload } from "../middleware/upload.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const uploadController = new UploadController();

router.post(
  "/upload",
  authMiddleware,
  upload.single("image"),
  uploadController.uploadImage.bind(uploadController),
);

router.put(
  "/upload",
  authMiddleware,
  upload.single("image"),
  uploadController.updateImage,
);

router.delete("/upload", authMiddleware, uploadController.deleteImage);

export default router;
