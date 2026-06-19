import swaggerJSDoc from "swagger-jsdoc";

const port = process.env.PORT || 5000;

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NeuroNudge API Documentation",
      version: "1.0.0",
      description: "Interactive API reference for the NeuroNudge Node.js/TypeScript backend.",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Firebase Client Auth ID Token. Enter token without 'Bearer ' prefix.",
        },
        AppCheckAuth: {
          type: "apiKey",
          in: "header",
          name: "X-Firebase-AppCheck",
          description: "Firebase App Check Attestation Token.",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The unique user identifier (Firebase UID)",
              example: "abc123xyz789",
            },
            email: {
              type: "string",
              description: "User's email address",
              example: "user@example.com",
            },
            name: {
              type: "string",
              nullable: true,
              description: "User's display name",
              example: "John Doe",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Account creation timestamp",
              example: "2026-06-20T00:00:00.000Z",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  example: "UNAUTHORIZED",
                },
                message: {
                  type: "string",
                  example: "Access token is missing or malformed",
                },
              },
            },
          },
        },
      },
    },
    paths: {
      "/api/user/register": {
        post: {
          summary: "Register a new user in the database",
          description: "Saves a new user in PostgreSQL. Expects no request body; email and display name are securely extracted from the validated Firebase ID Token.",
          security: [
            {
              BearerAuth: [],
              AppCheckAuth: [],
            },
          ],
          responses: {
            "201": {
              description: "User registered successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "User registered successfully" },
                      user: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized (missing, expired, or invalid Firebase ID Token / App Check token)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "409": {
              description: "Conflict (user is already registered in the database)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "500": {
              description: "Internal Server Error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/user/login": {
        post: {
          summary: "Login user and verify registration",
          description: "Verifies if the user exists in the local database. Expects no request body; the user UID is extracted from the validated Firebase ID Token.",
          security: [
            {
              BearerAuth: [],
              AppCheckAuth: [],
            },
          ],
          responses: {
            "200": {
              description: "User logged in successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "User logged in successfully" },
                      user: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized (missing, expired, or invalid Firebase ID Token / App Check token)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "404": {
              description: "Not Found (user record does not exist in the database)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "500": {
              description: "Internal Server Error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/user/profile": {
        get: {
          summary: "Retrieve user profile",
          description: "Fetches user details from the decoded session context.",
          security: [
            {
              BearerAuth: [],
              AppCheckAuth: [],
            },
          ],
          responses: {
            "200": {
              description: "Profile retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "Profile retrieved successfully" },
                      user: {
                        type: "object",
                        properties: {
                          uid: { type: "string", example: "abc123xyz789" },
                          email: { type: "string", example: "user@example.com" },
                          name: { type: "string", example: "John Doe" },
                          scopes: { type: "array", items: { type: "string" }, example: [] },
                          providerId: { type: "string", example: "password" },
                        },
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized (missing, expired, or invalid token)",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/images/upload": {
        post: {
          summary: "Upload an image",
          description: "Uploads an image to Cloudinary. Requires multipart/form-data with 'image' file field.",
          security: [
            {
              BearerAuth: [],
              AppCheckAuth: [],
            },
          ],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    image: {
                      type: "string",
                      format: "binary",
                      description: "The image file to upload",
                    },
                  },
                  required: ["image"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Image uploaded successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          publicId: { type: "string", example: "neuronudge/xyz123" },
                          imageUrl: { type: "string", example: "https://res.cloudinary.com/..." },
                        },
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request (e.g., no file uploaded)",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      message: { type: "string", example: "No file uploaded" },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "500": {
              description: "Upload failed",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      message: { type: "string", example: "Upload failed" },
                    },
                  },
                },
              },
            },
          },
        },
        put: {
          summary: "Update/Replace an image",
          description: "Overwrites an existing image on Cloudinary. Requires multipart/form-data with 'image' file field and 'publicId' text field.",
          security: [
            {
              BearerAuth: [],
              AppCheckAuth: [],
            },
          ],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    image: {
                      type: "string",
                      format: "binary",
                      description: "The new image file",
                    },
                    publicId: {
                      type: "string",
                      description: "The public ID of the image to replace",
                    },
                  },
                  required: ["image", "publicId"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Image replaced successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          publicId: { type: "string", example: "neuronudge/xyz123" },
                          imageUrl: { type: "string", example: "https://res.cloudinary.com/..." },
                        },
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      message: { type: "string", example: "No file uploaded" },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "500": {
              description: "Failed to update image",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      message: { type: "string", example: "Failed to update image" },
                    },
                  },
                },
              },
            },
          },
        },
        delete: {
          summary: "Delete an image",
          description: "Deletes an image from Cloudinary using its public ID.",
          security: [
            {
              BearerAuth: [],
              AppCheckAuth: [],
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    publicId: {
                      type: "string",
                      description: "The public ID of the image to delete",
                      example: "neuronudge/xyz123",
                    },
                  },
                  required: ["publicId"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Image deleted successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      data: {
                        type: "object",
                        properties: {
                          success: { type: "boolean", example: true },
                          message: { type: "string", example: "Image deleted successfully" },
                        },
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
            "500": {
              description: "Failed to delete image",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: false },
                      message: { type: "string", example: "Failed to delete image" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(options);
