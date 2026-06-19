/**
 * Express router defining endpoints for image file uploading and management.
 */
import { Router } from "express";
import { UploadController } from "../controllers/object.controller";
import { upload } from "../middleware/upload.middleware";
import { apiGatewayAuth, appCheck } from "../middleware/auth";

const router = Router();
const uploadController = new UploadController();

router.post(
  "/upload",
  appCheck,
  apiGatewayAuth(),
  upload.single("image"),
  uploadController.uploadImage.bind(uploadController)
);

router.put(
  "/upload",
  appCheck,
  apiGatewayAuth(),
  upload.single("image"),
  uploadController.updateImage
);

router.delete(
  "/upload",
  appCheck,
  apiGatewayAuth(),
  uploadController.deleteImage
);

export default router;