/**
 * HTTP client for the NeuroNudge backend API.
 *
 * Every request that requires authentication must include a Firebase
 * ID token obtained via `getCurrentIdToken()` from firebase.ts.
 * Tokens are fetched fresh before each call (force-refreshed) to
 * ensure expired tokens are never sent.
 */

import { getCurrentIdToken } from "./firebase";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiSuccessResponse {
  success: true;
  message: string;
  user: ApiUser;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Builds the Authorization header with a fresh Firebase ID token.
 */
const buildAuthHeaders = async (): Promise<HeadersInit> => {
  const token = await getCurrentIdToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ─── Endpoints ────────────────────────────────────────────────────────────────

/**
 * Synchronizes the authenticated Firebase user's record with the backend database.
 * Creates the database record if it doesn't exist, and updates verification status.
 *
 * Returns the synchronized user record on success, throws on failure.
 */
export const syncUser = async (): Promise<ApiUser> => {
  const headers = await buildAuthHeaders();

  const response = await fetch(`${BASE_URL}/api/user/sync`, {
    method: "POST",
    headers,
  });

  const data: ApiSuccessResponse | ApiErrorResponse = await response.json();

  if (!response.ok || !data.success) {
    const error = data as ApiErrorResponse;
    throw new Error(error.error?.message ?? "Synchronization failed.");
  }

  return (data as ApiSuccessResponse).user;
};

/**
 * Triggers the backend to generate and send a verification email via SMTP.
 */
export const sendVerificationEmail = async (): Promise<void> => {
  const headers = await buildAuthHeaders();

  const response = await fetch(`${BASE_URL}/api/user/send-verification`, {
    method: "POST",
    headers,
  });

  if (!response.ok) {
    const data: ApiErrorResponse = await response.json();
    throw new Error(data.error?.message ?? "Failed to send verification email.");
  }
};

/**
 * Triggers the backend to generate and send a password reset link via SMTP.
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/api/user/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const data: ApiErrorResponse = await response.json();
    throw new Error(data.error?.message ?? "Failed to request password reset.");
  }
};
