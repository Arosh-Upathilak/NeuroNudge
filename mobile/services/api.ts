import { Platform } from "react-native";
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

const buildAuthHeaders = async (): Promise<HeadersInit> => {
  const token = await getCurrentIdToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

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

export interface NlpChatResponse {
  success: boolean;
  data: {
    intent?: string;
    status?: string;
    reply: string;
    memories?: Array<{
      memoryId: string;
      title: string;
      description?: string;
      imageUrl?: string;
      latitude?: number;
      longitude?: number;
    }>;
  };
}

export const sendChatMessage = async (payload: {
  userText: string;
  latitude?: number;
  longitude?: number;
  imageUri?: string;
}): Promise<NlpChatResponse> => {
  const token = await getCurrentIdToken();
  const formData = new FormData();

  formData.append("userText", payload.userText);

  if (payload.latitude !== undefined) {
    formData.append("latitude", String(payload.latitude));
  }
  if (payload.longitude !== undefined) {
    formData.append("longitude", String(payload.longitude));
  }
  
  if (payload.imageUri) {
    const filename = payload.imageUri.split("/").pop() || "photo.jpg";
    const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
    const mimeType = ext === "png" ? "image/png" : "image/jpeg";

    if (Platform.OS === "web") {
      const resp = await fetch(payload.imageUri);
      const blob = await resp.blob();
      const file = new File([blob], filename, { type: mimeType });
      formData.append("image", file);
    } else {
      formData.append("image", {
        uri: payload.imageUri,
        name: filename,
        type: mimeType,
      } as any);
    }
  }

  const response = await fetch(`${BASE_URL}/api/nlp/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message ?? "Chat request failed.");
  }

  return data;
};
