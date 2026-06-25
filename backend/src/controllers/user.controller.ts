import { Response } from "express";
import { AuthRequest } from "../types/auth.types";
import prisma from "../config/prisma";

/**
 * Controller to handle user synchronization.
 * Atomically creates or updates the user record to prevent race conditions.
 * Enforces email validation from the authentication payload.
 */
export const syncUser = async (req: AuthRequest, res: Response): Promise<void> => {
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

  const { uid, email, name, email_verified } = firebaseUser;

  // Enforce validation for required email addresses
  if (!email) {
    res.status(400).json({
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Authentication payload lacks a valid email address.",
      },
    });
    return;
  }

  try {
    // Check if the user exists by ID
    let user = await prisma.user.findUnique({ where: { id: uid } });

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { id: uid },
        data: {
          isVerified: email_verified,
          name: name || undefined,
        },
      });
    } else {
      // User doesn't exist by ID. Check if an orphaned record exists by email.
      // This happens if Firebase user was deleted and recreated.
      const orphanedUser = await prisma.user.findUnique({ where: { email } });
      
      if (orphanedUser) {
        // Delete the orphaned record so the new Firebase UID can claim the email
        await prisma.user.delete({ where: { id: orphanedUser.id } });
      }

      // Create the new user
      user = await prisma.user.create({
        data: {
          id: uid,
          email: email,
          name: name || null,
          isVerified: email_verified,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "User synchronized successfully",
      user,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Error synchronizing user in database:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: `Database sync failed: ${errMsg}`,
      },
    });
  }
};

/**
 * Retrieves the profile of the currently authenticated user.
 */
export const getUserProfile = (req: AuthRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Profile retrieval failed: User context not found",
      },
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Profile retrieved successfully",
    user: req.user,
  });
};
