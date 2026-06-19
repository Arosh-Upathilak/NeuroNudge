/// <reference types="jest" />
import express, { Response } from "express";
import request from "supertest";
import { apiGatewayAuth } from "../index";
import { auth } from "../../../config/firebase";
import { AuthRequest } from "../../../types/auth.types";

// Mock Firebase Admin SDK Auth
jest.mock("../../../config/firebase", () => ({
  auth: {
    verifyIdToken: jest.fn(),
  },
}));

describe("API Gateway Authentication Middleware", () => {
  let app: express.Express;
  let originalNodeEnv: string | undefined;
  let mockFetch: jest.Mock;

  beforeAll(() => {
    originalNodeEnv = process.env.NODE_ENV;
    // Set up global fetch mock
    mockFetch = jest.fn();
    global.fetch = mockFetch as unknown as typeof global.fetch;
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = "development";
    process.env.FIREBASE_WEB_API_KEY = "test-api-key";

    // Setup a clean Express app for testing
    app = express();
    app.use(express.json());

    // Register test endpoints
    app.get("/test-default", apiGatewayAuth(), (req: AuthRequest, res: Response) => {
      res.status(200).json({ success: true, user: req.user });
    });

    app.get("/test-admin", apiGatewayAuth(["admin"]), (req: AuthRequest, res: Response) => {
      res.status(200).json({ success: true, user: req.user });
    });
  });

  describe("JWT Flow (Default)", () => {
    it("should return 401 if Authorization header is missing", async () => {
      const response = await request(app).get("/test-default");
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
    });

    it("should return 401 if Authorization header is not Bearer", async () => {
      const response = await request(app)
        .get("/test-default")
        .set("Authorization", "Basic credentials");
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe("UNAUTHORIZED");
    });

    it("should return 401 if token is expired", async () => {
      const mockError = { code: "auth/id-token-expired", message: "Token has expired" };
      (auth.verifyIdToken as jest.Mock).mockRejectedValueOnce(mockError);

      const response = await request(app)
        .get("/test-default")
        .set("Authorization", "Bearer expired-token");

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe("TOKEN_EXPIRED");
    });

    it("should return 401 if token is revoked", async () => {
      const mockError = { code: "auth/id-token-revoked", message: "Token has been revoked" };
      (auth.verifyIdToken as jest.Mock).mockRejectedValueOnce(mockError);

      const response = await request(app)
        .get("/test-default")
        .set("Authorization", "Bearer revoked-token");

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe("TOKEN_REVOKED");
    });

    it("should return 403 if user lacks required scope", async () => {
      const mockDecodedToken = {
        uid: "user-123",
        email: "user@example.com",
        name: "Test User",
        scopes: ["read:profile"],
        firebase: { sign_in_provider: "password" },
      };
      (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce(mockDecodedToken);

      const response = await request(app)
        .get("/test-admin")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("FORBIDDEN");
    });

    it("should succeed and attach user to request if token is valid and scopes match", async () => {
      const mockDecodedToken = {
        uid: "admin-123",
        email: "admin@example.com",
        name: "Admin User",
        scopes: ["admin", "read:profile"],
        firebase: { sign_in_provider: "google.com" },
      };
      (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce(mockDecodedToken);

      const response = await request(app)
        .get("/test-admin")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toEqual({
        uid: "admin-123",
        email: "admin@example.com",
        name: "Admin User",
        scopes: ["admin", "read:profile"],
        providerId: "google.com",
      });
    });
  });

  describe("OAuth Flow (x-oauth-provider is set)", () => {
    it("should return 401 if OAuth provider token exchange fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: "INVALID_CREDENTIALS" } }),
      });

      const response = await request(app)
        .get("/test-default")
        .set("Authorization", "Bearer oauth-token")
        .set("x-oauth-provider", "google.com");

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
    });

    it("should perform Google ID token exchange, verify Firebase token and succeed", async () => {
      // 1. Mock fetch token exchange return
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ idToken: "firebase-exchanged-jwt" }),
      });

      // 2. Mock Admin SDK token verification
      const mockDecodedToken = {
        uid: "oauth-user-123",
        email: "oauth@example.com",
        name: "OAuth User",
        scopes: [],
        firebase: { sign_in_provider: "google.com" },
      };
      (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce(mockDecodedToken);

      // A mock JWT token (3 parts) to trigger Google ID token flow
      const response = await request(app)
        .get("/test-default")
        .set("Authorization", "Bearer part1.part2.part3")
        .set("x-oauth-provider", "google.com");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.uid).toBe("oauth-user-123");
      expect(response.body.user.providerId).toBe("google.com");

      // Verify correct API parameter formatting (Google ID token check)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("signInWithIdp"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("id_token="),
        })
      );
    });

    it("should perform Google Access token exchange, verify Firebase token and succeed", async () => {
      // 1. Mock fetch token exchange return
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ idToken: "firebase-exchanged-jwt" }),
      });

      // 2. Mock Admin SDK token verification
      const mockDecodedToken = {
        uid: "oauth-user-123",
        email: "oauth@example.com",
        name: "OAuth User",
        scopes: [],
        firebase: { sign_in_provider: "google.com" },
      };
      (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce(mockDecodedToken);

      // A non-JWT token to trigger Google Access token flow
      const response = await request(app)
        .get("/test-default")
        .set("Authorization", "Bearer google-raw-access-token")
        .set("x-oauth-provider", "google.com");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.uid).toBe("oauth-user-123");

      // Verify correct API parameter formatting (Google Access token check)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("signInWithIdp"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("access_token="),
        })
      );
    });
  });

  describe("Security Controls", () => {
    it("should reject non-HTTPS requests in production", async () => {
      process.env.NODE_ENV = "production";

      const response = await request(app)
        .get("/test-default")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe("HTTPS_REQUIRED");
    });

    it("should set no-cache headers on auth routes", async () => {
      const mockDecodedToken = {
        uid: "user-123",
        firebase: { sign_in_provider: "password" },
      };
      (auth.verifyIdToken as jest.Mock).mockResolvedValueOnce(mockDecodedToken);

      const response = await request(app)
        .get("/test-default")
        .set("Authorization", "Bearer valid-token");

      expect(response.headers["cache-control"]).toContain("no-store");
      expect(response.headers["cache-control"]).toContain("no-cache");
      expect(response.headers["pragma"]).toBe("no-cache");
      expect(response.headers["expires"]).toBe("0");
    });
  });
});
