/// <reference types="jest" />
import { CloudinaryService } from "../image.service";
import cloudinary from "../../config/cloudinary";

jest.mock("../../config/cloudinary", () => ({
  __esModule: true,
  default: {
    uploader: {
      upload: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

describe("CloudinaryService", () => {
  let service: CloudinaryService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CloudinaryService();
  });

  describe("uploadImage", () => {
    it("should upload image successfully and return credentials", async () => {
      const mockResult = {
        public_id: "test-id",
        secure_url: "https://cloudinary.com/test-id",
      };
      (cloudinary.uploader.upload as jest.Mock).mockResolvedValueOnce(mockResult);

      const result = await service.uploadImage("temp-path.jpg");

      expect(cloudinary.uploader.upload).toHaveBeenCalledWith("temp-path.jpg", {
        folder: "neuronudge",
      });
      expect(result).toEqual({
        publicId: "test-id",
        imageUrl: "https://cloudinary.com/test-id",
      });
    });

    it("should throw standard error if upload fails", async () => {
      (cloudinary.uploader.upload as jest.Mock).mockRejectedValueOnce(new Error("Cloudinary error"));

      await expect(service.uploadImage("temp-path.jpg")).rejects.toThrow(
        "Failed to upload image to Cloudinary"
      );
    });
  });

  describe("deleteImage", () => {
    it("should delete image successfully", async () => {
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValueOnce({ result: "ok" });

      const result = await service.deleteImage("test-id");

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("test-id");
      expect(result).toEqual({
        success: true,
        message: "Image deleted successfully",
      });
    });

    it("should throw error if image delete result is not ok", async () => {
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValueOnce({ result: "not found" });

      await expect(service.deleteImage("test-id")).rejects.toThrow(
        "Failed to delete image from Cloudinary"
      );
    });

    it("should throw error if destruction function rejects", async () => {
      (cloudinary.uploader.destroy as jest.Mock).mockRejectedValueOnce(new Error("Destruction failed"));

      await expect(service.deleteImage("test-id")).rejects.toThrow(
        "Failed to delete image from Cloudinary"
      );
    });
  });

  describe("updateImage", () => {
    it("should update image by calling delete then upload", async () => {
      const deleteSpy = jest.spyOn(service, "deleteImage").mockResolvedValueOnce({
        success: true,
        message: "Deleted",
      });
      const uploadSpy = jest.spyOn(service, "uploadImage").mockResolvedValueOnce({
        publicId: "new-id",
        imageUrl: "https://cloudinary.com/new-id",
      });

      const result = await service.updateImage("old-id", "new-path.jpg");

      expect(deleteSpy).toHaveBeenCalledWith("old-id");
      expect(uploadSpy).toHaveBeenCalledWith("new-path.jpg");
      expect(result).toEqual({
        publicId: "new-id",
        imageUrl: "https://cloudinary.com/new-id",
      });
    });

    it("should throw update error if deletion fails", async () => {
      jest.spyOn(service, "deleteImage").mockRejectedValueOnce(new Error("Deletion error"));

      await expect(service.updateImage("old-id", "new-path.jpg")).rejects.toThrow(
        "Failed to update image"
      );
    });

    it("should throw update error if upload fails", async () => {
      jest.spyOn(service, "deleteImage").mockResolvedValueOnce({
        success: true,
        message: "Deleted",
      });
      jest.spyOn(service, "uploadImage").mockRejectedValueOnce(new Error("Upload error"));

      await expect(service.updateImage("old-id", "new-path.jpg")).rejects.toThrow(
        "Failed to update image"
      );
    });
  });

  describe("replaceImage", () => {
    it("should replace image on Cloudinary with overwrite and invalidate options", async () => {
      const mockResult = {
        public_id: "test-id",
        secure_url: "https://cloudinary.com/test-id",
      };
      (cloudinary.uploader.upload as jest.Mock).mockResolvedValueOnce(mockResult);

      const result = await service.replaceImage("test-id", "new-path.jpg");

      expect(cloudinary.uploader.upload).toHaveBeenCalledWith("new-path.jpg", {
        public_id: "test-id",
        overwrite: true,
        invalidate: true,
      });
      expect(result).toEqual({
        publicId: "test-id",
        imageUrl: "https://cloudinary.com/test-id",
      });
    });

    it("should throw error if replace upload fails", async () => {
      (cloudinary.uploader.upload as jest.Mock).mockRejectedValueOnce(new Error("Upload failed"));

      await expect(service.replaceImage("test-id", "new-path.jpg")).rejects.toThrow(
        "Failed to replace image"
      );
    });
  });
});
