import { Response } from "express";
import { AuthRequest } from "../types/auth.types";
import prisma from "../config/prisma";

/**
 * Controller to handle user registration.
 * Creates a new user record in the database.
 */
export const registerUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const firebaseUser = req.user;

  if (!firebaseUser) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication payload is missing",
      },
    });
    return;
  }

  const { uid, email, name } = firebaseUser;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: uid },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: {
          code: "USER_ALREADY_EXISTS",
          message: "User is already registered in the database",
        },
      });
      return;
    }

    const newUser = await prisma.user.create({
      data: {
        id: uid,
        email: email || "",
        name: name || null,
      },
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error registering user in database:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to register user in the database",
      },
    });
  }
};

export const loginUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const firebaseUser = req.user;

  if (!firebaseUser) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication payload is missing",
      },
    });
    return;
  }

  const { uid } = firebaseUser;

  try {
    const user = await prisma.user.findUnique({
      where: { id: uid },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User record not found in the database. Please register first.",
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to query user during login",
      },
    });
  }
};

export const getUserProfile = (req: AuthRequest, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Profile retrieved successfully",
    user: req.user,
  });
};
