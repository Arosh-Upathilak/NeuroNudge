/// <reference types="jest" />
import express, { Response } from "express";
import request from "supertest";
import { appCheck } from "../appcheck.middleware";
import { getAppCheck } from "firebase-admin/app-check";
const mockVerifyToken = jest.fn();

// Mock Firebase Admin App Check SDK
jest.mock("firebase-admin/app-check", () => {
  return {
    getAppCheck: jest.fn(),
  };
});

describe("Firebase App Check Middleware", () => {
  let app: express.Express;
  let originalNodeEnv: string | undefined;

  beforeAll(() => {
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  beforeEach(() => {
    process.env.NODE_ENV = "development";
    process.env.APP_CHECK_BYPASS_TOKEN = "development-secret-bypass-token";

    // Re-establish mock return value before each test (due to resetMocks config)
    (getAppCheck as jest.Mock).mockReturnValue({
      verifyToken: mockVerifyToken,
    });

    // Setup test app
    app = express();
    app.get("/test-appcheck", appCheck, (req, res: Response) => {
      res.status(200).json({ success: true });
    });
  });

  it("should return 401 if X-Firebase-AppCheck header is missing", async () => {
    const response = await request(app).get("/test-appcheck");
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("APP_CHECK_MISSING");
  });

  it("should bypass verification if X-Firebase-AppCheck matches APP_CHECK_BYPASS_TOKEN", async () => {
    const response = await request(app)
      .get("/test-appcheck")
      .set("X-Firebase-AppCheck", "development-secret-bypass-token");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(mockVerifyToken).not.toHaveBeenCalled();
  });

  it("should return 401 if App Check token is invalid or expired", async () => {
    process.env.NODE_ENV = "production"; // force actual verification instead of test short-circuit
    mockVerifyToken.mockRejectedValueOnce(new Error("Invalid token signature"));

    const response = await request(app)
      .get("/test-appcheck")
      .set("X-Firebase-AppCheck", "invalid-token")
      .set("x-forwarded-proto", "https");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("APP_CHECK_INVALID");
    expect(mockVerifyToken).toHaveBeenCalledWith("invalid-token");
  });

  it("should succeed and continue if App Check token is verified", async () => {
    process.env.NODE_ENV = "production"; // force actual verification
    mockVerifyToken.mockResolvedValueOnce({
      appId: "some-app-id",
      token: "valid-token",
    });

    const response = await request(app)
      .get("/test-appcheck")
      .set("X-Firebase-AppCheck", "valid-token")
      .set("x-forwarded-proto", "https");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(mockVerifyToken).toHaveBeenCalledWith("valid-token");
  });

  it("should reject non-HTTPS requests in production", async () => {
    process.env.NODE_ENV = "production";

    const response = await request(app)
      .get("/test-appcheck")
      .set("X-Firebase-AppCheck", "valid-token");

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("HTTPS_REQUIRED");
  });

  it("should set no-cache headers on response", async () => {
    const response = await request(app)
      .get("/test-appcheck")
      .set("X-Firebase-AppCheck", "development-secret-bypass-token");

    expect(response.headers["cache-control"]).toContain("no-store");
    expect(response.headers["cache-control"]).toContain("no-cache");
    expect(response.headers["pragma"]).toBe("no-cache");
    expect(response.headers["expires"]).toBe("0");
  });
});
