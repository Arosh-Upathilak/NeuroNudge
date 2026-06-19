import { Response } from "express";
import { MemoryService } from "../services/memory.service";
import { CloudinaryService } from "../services/image.service";
import { AuthRequest } from "../types/auth.types";
import {
  CreateMemoryInput,
  UpdateMemoryInput,
  GetandDeleteMemoryInput,
  UpsertMemoryImageInput,
} from "../types/memory.types";

const cloudinaryService = new CloudinaryService();

/**
 * MEMORY CONTROLLER
 */
export const MemoryController = {
  /**
   * CREATE MEMORY
   */
  createMemory: async (
    req: AuthRequest<any, any, CreateMemoryInput>,
    res: Response
  ) => {
    try {
      const userId = req.user!.uid;

      let imageData: { imageUrl?: string; publicId?: string } = {};

      if (req.file?.path) {
        imageData = await cloudinaryService.uploadImage(req.file.path);
      }

      const memory = await MemoryService.createMemory({
        userId,
        title: req.body.title,
        description: req.body.description,
        imageUrl: imageData.imageUrl,
        publicId: imageData.publicId,
        latitude: Number(req.body.latitude),
        longitude: Number(req.body.longitude),
      });

      return res.status(201).json({
        success: true,
        data: memory,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * GET ALL MEMORIES
   */
  getMemories: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.uid;

      const memories = await MemoryService.getMemoriesByUser(userId);

      return res.status(200).json({
        success: true,
        data: memories,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * GET MEMORY BY ID
   */
  getMemoryById: async (
    req: AuthRequest<any, any, GetandDeleteMemoryInput>,
    res: Response
  ) => {
    try {
      const userId = req.user!.uid;
      const memoryId = req.params.id;

      const memory = await MemoryService.getMemoryById(memoryId, userId);

      if (!memory) {
        return res.status(404).json({
          success: false,
          message: "Memory not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: memory,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * UPDATE MEMORY
   */
  updateMemory: async (
    req: AuthRequest<any, any, UpdateMemoryInput>,
    res: Response
  ) => {
    try {
      const userId = req.user!.uid;
      const memoryId = req.params.id;

      const result = await MemoryService.updateMemory(
        memoryId,
        userId,
        req.body
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * DELETE MEMORY
   */
  deleteMemory: async (
    req: AuthRequest<any, any, GetandDeleteMemoryInput>,
    res: Response
  ) => {
    try {
      const userId = req.user!.uid;
      const memoryId = req.params.id;

      await MemoryService.deleteMemory(memoryId, userId);

      return res.status(200).json({
        success: true,
        message: "Memory deleted successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * UPSERT MEMORY IMAGE
   */
  upsertMemoryImage: async (
    req: AuthRequest<any, any, UpsertMemoryImageInput>,
    res: Response
  ) => {
    try {
      const memoryId = req.params.id;

      let imageData: { imageUrl?: string; publicId?: string } = {};

      if (req.file?.path) {
        imageData = await cloudinaryService.uploadImage(req.file.path);
      }

      const result = await MemoryService.upsertMemoryImage({
        memoryId,
        imageUrl: imageData.imageUrl!,
        publicId: imageData.publicId,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  /**
   * DELETE MEMORY IMAGE
   */
  deleteMemoryImage: async (
    req: AuthRequest<any, any, GetandDeleteMemoryInput>,
    res: Response
  ) => {
    try {
      const memoryId = req.params.id;

      await MemoryService.deleteMemoryImage(memoryId);

      return res.status(200).json({
        success: true,
        message: "Image deleted successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};