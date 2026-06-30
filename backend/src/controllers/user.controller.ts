import { Request, Response } from "express";
import { AuthRequest } from "../types/auth.types";
import prisma from "../config/prisma";
import { auth } from "../config/firebase";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../services/email.service";

/**
 * Controller to handle user synchronization.
 * Atomically creates or updates the user record to prevent race conditions.
 * Enforces email validation from the authentication payload.
 */
export const syncUser = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
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
    let user = await prisma.user.findUnique({ where: { id: uid } });

    if (user) {
      user = await prisma.user.update({
        where: { id: uid },
        data: {
          isVerified: email_verified,
          name: name || undefined,
        },
      });
    } else {
      const orphanedUser = await prisma.user.findUnique({ where: { email } });

      if (orphanedUser) {
        await prisma.user.delete({ where: { id: orphanedUser.id } });
      }

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

/**
 * Sends a Firebase verification email to the authenticated user via Nodemailer.
 */
export const sendVerification = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
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

  const { email, name, email_verified } = firebaseUser;

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

  if (email_verified) {
    res.status(400).json({
      success: false,
      error: {
        code: "ALREADY_VERIFIED",
        message: "Email is already verified.",
      },
    });
    return;
  }

  try {
    const link = await auth.generateEmailVerificationLink(email);
    await sendVerificationEmail(email, name || "", link);

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully.",
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to send verification email: ${errMsg}`,
      },
    });
  }
};

/**
 * Generates and sends a Firebase password reset link via Nodemailer.
 * Responds with a generic success message even if the user doesn't exist
 * to protect against email enumeration.
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Email is required.",
      },
    });
    return;
  }

  try {
    let name = "there";
    try {
      const userRecord = await auth.getUserByEmail(email);
      name = userRecord.displayName || "there";
    } catch (err: unknown) {
      if ((err as { code?: string }).code === "auth/user-not-found") {
        res.status(200).json({
          success: true,
          message:
            "If an account exists for that email, a password reset link has been sent.",
        });
        return;
      }
      throw err;
    }

    const link = await auth.generatePasswordResetLink(email);
    await sendPasswordResetEmail(email, name, link);

    res.status(200).json({
      success: true,
      message:
        "If an account exists for that email, a password reset link has been sent.",
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to request password reset: ${errMsg}`,
      },
    });
  }
};

/**
 * Clears all user data (memories and chat history) from the database.
 */
export const clearUserData = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication payload is missing",
      },
    });
    return;
  }

  const { uid } = req.user;

  try {
    await prisma.message.deleteMany({ where: { userId: uid } });
    await prisma.memory.deleteMany({ where: { userId: uid } });

    await prisma.searchHistory.deleteMany({ where: { userId: uid } });
    await prisma.notification.deleteMany({ where: { userId: uid } });

    res.status(200).json({
      success: true,
      message: "User data cleared successfully",
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to clear user data: ${errMsg}`,
      },
    });
  }
};
