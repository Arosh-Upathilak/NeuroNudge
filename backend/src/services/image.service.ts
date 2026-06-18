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
    } catch  {
      throw new Error("Failed to upload image to Cloudinary");
    }
  }
}