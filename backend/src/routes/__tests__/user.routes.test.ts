/// <reference types="jest" />
import express from "express";
import request from "supertest";
import userRoutes from "../user.routes";
import { auth } from "../../config/firebase";
import prisma from "../../config/prisma";

// Mock Firebase Admin SDK Auth
jest.mock("../../config/firebase", () => ({
  auth: {
    verifyIdToken: jest.fn(),
  },
}));

// Mock Prisma Client
jest.mock("../../config/prisma", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe("User Routes (Register and Login)", () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = "development";
    process.env.APP_CHECK_BYPASS_TOKEN = "development-secret-bypass-token";

    // Setup a clean Express app for testing
    app = express();
    app.use(express.json());
    app.use("/api/user", userRoutes);
  });

  describe("POST /api/user/register", () => {
    it("should return 401 if Authorization header is missing", async () => {
      const response = await request(app)
        .post("/api/user/register")
        .set("X-Firebase-AppCheck", "development-secret-bypass-token");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
    });

    it("should return 409 if user already exists in the database", async () => {
      const mockDecodedToken = {
        uid: "user-123",
        email: "user@example.com",
        name: "Test User",
        scopes: [],
        firebase: { sign_in_provider: "password" },
      };
      (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce(mockDecodedToken);
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: "user-123",
        email: "user@example.com",
        name: "Test User",
      });

      const response = await request(app)
        .post("/api/user/register")
        .set("X-Firebase-AppCheck", "development-secret-bypass-token")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("USER_ALREADY_EXISTS");
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-123" },
      });
    });

    it("should return 201 and create user if user does not exist", async () => {
      const mockDecodedToken = {
        uid: "new-user-123",
        email: "new@example.com",
        name: "New User",
        scopes: [],
        firebase: { sign_in_provider: "password" },
      };
      (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce(mockDecodedToken);
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (prisma.user.create as jest.Mock).mockResolvedValueOnce({
        id: "new-user-123",
        email: "new@example.com",
        name: "New User",
      });

      const response = await request(app)
        .post("/api/user/register")
        .set("X-Firebase-AppCheck", "development-secret-bypass-token")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toEqual({
        id: "new-user-123",
        email: "new@example.com",
        name: "New User",
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          id: "new-user-123",
          email: "new@example.com",
          name: "New User",
        },
      });
    });
  });

  describe("POST /api/user/login", () => {
    it("should return 401 if Authorization header is missing", async () => {
      const response = await request(app)
        .post("/api/user/login")
        .set("X-Firebase-AppCheck", "development-secret-bypass-token");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return 404 if user is not registered in the database", async () => {
      const mockDecodedToken = {
        uid: "unregistered-123",
        email: "unregistered@example.com",
        name: "Unregistered User",
        scopes: [],
        firebase: { sign_in_provider: "password" },
      };
      (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce(mockDecodedToken);
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post("/api/user/login")
        .set("X-Firebase-AppCheck", "development-secret-bypass-token")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("USER_NOT_FOUND");
    });

    it("should return 200 and user data if user is found in the database", async () => {
      const mockDecodedToken = {
        uid: "registered-123",
        email: "registered@example.com",
        name: "Registered User",
        scopes: [],
        firebase: { sign_in_provider: "password" },
      };
      (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce(mockDecodedToken);
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: "registered-123",
        email: "registered@example.com",
        name: "Registered User",
      });

      const response = await request(app)
        .post("/api/user/login")
        .set("X-Firebase-AppCheck", "development-secret-bypass-token")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toEqual({
        id: "registered-123",
        email: "registered@example.com",
        name: "Registered User",
      });
    });
  });
});
