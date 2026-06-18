import { Request, Response } from "express";
import { CloudinaryService } from "../services/image.service";

const cloudinaryService = new CloudinaryService();

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
    } catch  {
      return res.status(500).json({
        success: false,
        message: "Upload failed",
      });
    }
  }
}