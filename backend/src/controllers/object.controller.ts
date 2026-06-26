import { Request, Response } from "express";
import fs from "fs";
import { CloudinaryService } from "../services/image.service";

const cloudinaryService = new CloudinaryService();

/**
 * Controller to handle image uploads, replacements, and deletions.
 */
export class UploadController {
  async uploadImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const result = await cloudinaryService.uploadImage(
        req.file.path
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch {
      return res.status(500).json({
        success: false,
        message: "Upload failed",
      });
    } finally {
      if (req.file?.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error("Failed to delete temp file:", err);
        }
      }
    }
  }

  async updateImage(req: Request, res: Response) {
    try {
      const { publicId } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const result = await cloudinaryService.replaceImage(
        publicId,
        req.file.path
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch {
      return res.status(500).json({
        success: false,
        message: "Failed to update image",
      });
    } finally {
      if (req.file?.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error("Failed to delete temp file:", err);
        }
      }
    }
  }

  async deleteImage(req: Request, res: Response) {
    try {
      const { publicId } = req.body;
      
      const result = await cloudinaryService.deleteImage(
        publicId
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch {
      return res.status(500).json({
        success: false,
        message: "Failed to delete image",
      });
    }
  }
}