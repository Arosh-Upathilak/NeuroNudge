import { Router } from "express";
import { MemoryController } from "../controllers/memory.controller";
import { mockAuth } from "../mockAuth/mockAuth.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();

const auth = mockAuth;


router.post(
  "/",
  auth,
  upload.single("image"),
  MemoryController.createMemory.bind(MemoryController)
);
/**
 * GET ALL MEMORIES
 */
router.get(
  "/",
  auth,
  MemoryController.getMemories.bind(MemoryController)
);

/**
 * GET MEMORY BY ID
 */
router.get(
  "/:id",
  auth,
  MemoryController.getMemoryById.bind(MemoryController)
);

/**
 * UPDATE MEMORY (title, description,location)
 */
router.put(
  "/:id",
  auth,
  MemoryController.updateMemory.bind(MemoryController)
);

/**
 * DELETE MEMORY
 */
router.delete(
  "/:id",
  auth,
  MemoryController.deleteMemory.bind(MemoryController)
);

/**
 * UPSERT MEMORY IMAGE
 * (upload or replace image via Cloudinary)
 */
router.put(
  "/:id/image",
  auth,
  upload.single("image"),
  MemoryController.upsertMemoryImage.bind(MemoryController)
);

/**
 * DELETE MEMORY IMAGE ONLY
 */
router.delete(
  "/:id/image",
  auth,
  MemoryController.deleteMemoryImage.bind(MemoryController)
);

export default router;