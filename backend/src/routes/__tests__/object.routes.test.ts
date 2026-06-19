/// <reference types="jest" />
import express from "express";
import request from "supertest";
import objectRoutes from "../object.routes";
import { auth } from "../../config/firebase";

// Mock Firebase Admin SDK Auth
jest.mock("../../config/firebase", () => ({
  auth: {
    verifyIdToken: jest.fn(),
  },
}));

import { CloudinaryService } from "../../services/image.service";

// Mock Cloudinary Service methods automatically using jest class auto-mocking
jest.mock("../../services/image.service");

const mockUploadImage = CloudinaryService.prototype.uploadImage as jest.Mock;
const mockDeleteImage = CloudinaryService.prototype.deleteImage as jest.Mock;
const mockReplaceImage = CloudinaryService.prototype.replaceImage as jest.Mock;
const _mockUpdateImage = CloudinaryService.prototype.updateImage as jest.Mock;

// Mock Multer upload middleware to inject files in-memory
let mockFileToInject: Partial<Express.Multer.File> | undefined = undefined;

jest.mock("../../middleware/upload.middleware", () => {
  return {
    upload: {
      single: jest.fn().mockImplementation(() => {
        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
          if (mockFileToInject) {
            req.file = mockFileToInject as Express.Multer.File;
          }
          next();
        };
      }),
    },
  };
});

describe("Object Routes (Image Upload & Management)", () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = "development";
    process.env.APP_CHECK_BYPASS_TOKEN = "test-bypass-token";
    mockFileToInject = undefined;

    // Set up a clean Express app for testing
    app = express();
    app.use(express.json());
    app.use("/api/images", objectRoutes);
  });

  const mockUserToken = {
    uid: "user-123",
    email: "user@example.com",
    name: "Test User",
    scopes: [],
    firebase: { sign_in_provider: "password" },
  };

  describe("POST /api/images/upload", () => {
    it("should return 401 if App Check header is missing", async () => {
      const response = await request(app)
        .post("/api/images/upload")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("APP_CHECK_MISSING");
    });

    it("should return 401 if Auth header is missing", async () => {
      const response = await request(app)
        .post("/api/images/upload")
        .set("X-Firebase-AppCheck", "test-bypass-token");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
    });

    it("should return 400 if no file is uploaded", async () => {
      (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce(mockUserToken);

      const response = await request(app)
        .post("/api/images/upload")
        .set("X-Firebase-AppCheck", "test-bypass-token")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("No file uploaded");
    });

    it("should return 200 and image data on successful upload", async () => {
      (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce(mockUserToken);
      mockFileToInject = { path: "temp-path.jpg" };
      mockUploadImage.mockResolvedValueOnce({
        publicId: "cloud-id-123",
        imageUrl: "https://cloudinary.com/cloud-id-123",
      });

      const response = await request(app)
        .post("/api/images/upload")
        .set("X-Firebase-AppCheck", "test-bypass-token")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        publicId: "cloud-id-123",
        imageUrl: "https://cloudinary.com/cloud-id-123",
      });
      expect(mockUploadImage).toHaveBeenCalledWith("temp-path.jpg");
    });

    it("should return 500 if the image service fails to upload", async () => {
      (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce(mockUserToken);
      mockFileToInject = { path: "temp-path.jpg" };
      mockUploadImage.mockRejectedValueOnce(new Error("Upload service failed"));

      const response = await request(app)
        .post("/api/images/upload")
        .set("X-Firebase-AppCheck", "test-bypass-token")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Upload failed");
    });
  });

  describe("PUT /api/images/upload", () => {
    it("should return 400 if no file is uploaded", async () => {
      (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce(mockUserToken);

      const response = await request(app)
        .put("/api/images/upload")
        .set("X-Firebase-AppCheck", "test-bypass-token")
        .set("Authorization", "Bearer valid-token")
        .send({ publicId: "old-id" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("No file uploaded");
    });

    it("should return 200 and new image details on successful replace", async () => {
      (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce(mockUserToken);
      mockFileToInject = { path: "new-temp-path.jpg" };
      mockReplaceImage.mockResolvedValueOnce({
        publicId: "old-id",
        imageUrl: "https://cloudinary.com/old-id-replaced",
      });

      const response = await request(app)
        .put("/api/images/upload")
        .set("X-Firebase-AppCheck", "test-bypass-token")
        .set("Authorization", "Bearer valid-token")
        .send({ publicId: "old-id" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        publicId: "old-id",
        imageUrl: "https://cloudinary.com/old-id-replaced",
      });
      expect(mockReplaceImage).toHaveBeenCalledWith("old-id", "new-temp-path.jpg");
    });

    it("should return 500 if the replacement service fails", async () => {
      (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce(mockUserToken);
      mockFileToInject = { path: "new-temp-path.jpg" };
      mockReplaceImage.mockRejectedValueOnce(new Error("Replace failed"));

      const response = await request(app)
        .put("/api/images/upload")
        .set("X-Firebase-AppCheck", "test-bypass-token")
        .set("Authorization", "Bearer valid-token")
        .send({ publicId: "old-id" });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Failed to update image");
    });
  });

  describe("DELETE /api/images/upload", () => {
    it("should return 200 and deletion result on successful delete", async () => {
      (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce(mockUserToken);
      mockDeleteImage.mockResolvedValueOnce({
        success: true,
        message: "Image deleted successfully",
      });

      const response = await request(app)
        .delete("/api/images/upload")
        .set("X-Firebase-AppCheck", "test-bypass-token")
        .set("Authorization", "Bearer valid-token")
        .send({ publicId: "cloud-id-123" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        success: true,
        message: "Image deleted successfully",
      });
      expect(mockDeleteImage).toHaveBeenCalledWith("cloud-id-123");
    });

    it("should return 500 if deletion service fails", async () => {
      (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce(mockUserToken);
      mockDeleteImage.mockRejectedValueOnce(new Error("Deletion failed"));

      const response = await request(app)
        .delete("/api/images/upload")
        .set("X-Firebase-AppCheck", "test-bypass-token")
        .set("Authorization", "Bearer valid-token")
        .send({ publicId: "cloud-id-123" });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Failed to delete image");
    });
  });
});
