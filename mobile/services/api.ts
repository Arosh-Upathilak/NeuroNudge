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
    throw new Error(
      data.error?.message ?? "Failed to send verification email.",
    );
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

/**
 * Clears all user data (memories and chat history) from the backend database.
 */
export const clearUserData = async (): Promise<void> => {
  const headers = await buildAuthHeaders();

  const response = await fetch(`${BASE_URL}/api/user/data`, {
    method: "DELETE",
    headers,
  });

  const data: ApiSuccessResponse | ApiErrorResponse = await response.json();

  if (!response.ok || !data.success) {
    const error = data as ApiErrorResponse;
    throw new Error(error.error?.message ?? "Failed to clear user data.");
  }
};


export interface ApiMemory {
  memoryId: string;
  userId: string;
  title: string;
  description: string | null;
  createdAt: string;
  image: {
    id: string;
    imageUrl: string;
    publicId: string | null;
    memoryId: string;
  } | null;
  location: {
    id: string;
    latitude: number;
    longitude: number;
    memoryId: string;
  } | null;
}

export interface ApiMessage {
  messageId: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  aiContent: string | null;
  createdAt: string;
}

export interface NlpChatResponse {
  status?:
    "CREATED" | "UPDATED" | "FOUND" | "MULTIPLE_MATCHES" | "NOT_FOUND" | "CHAT";
  intent?: string;
  reply: string;
  memories?: {
    memoryId?: string;
    title: string;
    description?: string;
    imageUrl?: string;
    publicId?: string;
    latitude?: number;
    longitude?: number;
    createdAt?: string;
    createdat?: string;
  }[];
}

/**
 * Builds authorization headers without Content-Type, suitable for FormData.
 */
const buildAuthMultipartHeaders = async (): Promise<HeadersInit> => {
  const token = await getCurrentIdToken();
  return {
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Fetches all memories for the authenticated user.
 */
export const getMemories = async (): Promise<ApiMemory[]> => {
  const headers = await buildAuthHeaders();
  const response = await fetch(`${BASE_URL}/api/memories`, {
    method: "GET",
    headers,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch memories.");
  }
  return data.data;
};

/**
 * Fetches the user's message history.
 */
export const getMessages = async (): Promise<ApiMessage[]> => {
  const headers = await buildAuthHeaders();
  const response = await fetch(`${BASE_URL}/api/messages`, {
    method: "GET",
    headers,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch message history.");
  }
  return data.data;
};

/**
 * Sends a message query to the NLP agent, optionally including location coordinates and an image attachment.
 */
export const sendNlpChat = async (
  userText: string,
  latitude?: number,
  longitude?: number,
  imageUri?: string,
): Promise<NlpChatResponse> => {
  const headers = await buildAuthMultipartHeaders();
  const formData = new FormData();
  formData.append("userText", userText);

  if (latitude !== undefined && latitude !== null) {
    formData.append("latitude", String(latitude));
  }
  if (longitude !== undefined && longitude !== null) {
    formData.append("longitude", String(longitude));
  }

  if (imageUri) {
    const uriParts = imageUri.split(".");
    const fileType = uriParts[uriParts.length - 1];
    const name = `photo_${Date.now()}.${fileType}`;
    formData.append("image", {
      uri: imageUri,
      name,
      type: `image/${fileType === "jpg" ? "jpeg" : fileType}`,
    } as any);
  }

  const response = await fetch(`${BASE_URL}/api/nlp/chat`, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to process chat message.");
  }
  return data.data;
};
