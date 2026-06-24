import { Router } from "express";
import { MemoryController } from "../controllers/memory.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();



router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  MemoryController.createMemory.bind(MemoryController)
);
/**
 * GET ALL MEMORIES
 */
router.get(
  "/",
  authMiddleware,
  MemoryController.getMemories.bind(MemoryController)
);

/**
 * GET MEMORY BY ID
 */
router.get(
  "/:id",
 authMiddleware,
  MemoryController.getMemoryById.bind(MemoryController)
);

/**
 * UPDATE MEMORY (title, description,location)
 */
router.put(
  "/:id",
  authMiddleware,
  MemoryController.updateMemory.bind(MemoryController)
);

/**
 * DELETE MEMORY
 */
router.delete(
  "/:id",
  authMiddleware,
  MemoryController.deleteMemory.bind(MemoryController)
);

/**
 * UPSERT MEMORY IMAGE
 * (upload or replace image via Cloudinary)
 */
router.put(
  "/:id/image",
 authMiddleware,
  upload.single("image"),
  MemoryController.upsertMemoryImage.bind(MemoryController)
);

/**
 * DELETE MEMORY IMAGE ONLY
 */
router.delete(
  "/:id/image",
  authMiddleware,
  MemoryController.deleteMemoryImage.bind(MemoryController)
);

export default router;