import cloudinary from "../config/cloudinary";


export class CloudinaryService {
  async uploadImage(filePath: string) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "neuronudge",
      });

      return {
        publicId: result.public_id,
        imageUrl: result.secure_url,
      };
    } catch {
      throw new Error("Failed to upload image to Cloudinary");
    }
  }

  async deleteImage(publicId: string) {
      
    try {
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result !== "ok") {
        throw new Error("Image not found");
      }

      return {
        success: true,
        message: "Image deleted successfully",
      };
    } catch {
      throw new Error("Failed to delete image from Cloudinary");
    }
  }

  async updateImage(oldPublicId: string, newFilePath: string) {
    try {
      // Delete old image
      await this.deleteImage(oldPublicId);

      // Upload new image
      const result = await this.uploadImage(newFilePath);

      return {
        publicId: result.publicId,
        imageUrl: result.imageUrl,
      };
    } catch {
      throw new Error("Failed to update image");
    }
  }

  async replaceImage(publicId: string, newFilePath: string) {
    try {
      const result = await cloudinary.uploader.upload(newFilePath, {
        public_id: publicId,
        overwrite: true,
        invalidate: true,
      });

      return {
        publicId: result.public_id,
        imageUrl: result.secure_url,
      };
    } catch {
      throw new Error("Failed to replace image");
    }
  }
}