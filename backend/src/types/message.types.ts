import { MessageRole, Action } from "@prisma/client";

/* ================= CREATE MESSAGE ================= */
export interface CreateMessageInput {
  userId: string;
  role: MessageRole;
  content: string;
  aiContent?: string;
 
}

/* ================= UPDATE MESSAGE ================= */
export interface UpdateMessageInput {
  messageId: string;
  content?: string;
  aiContent?: string;
  memoryId?: string | null;
  action?: Action | null;
}

/* ================= MESSAGE RESPONSE ================= */
export interface MessageResponse {
  messageId: string;
  userId: string;
  role: MessageRole;
  content: string;
  aiContent?: string | null;
  memoryId?: string | null;
  action?: Action | null;
  createdAt: Date;
}

/* ================= CONTROLLER REQUEST BODY ================= */
export interface CreateMessageRequestBody {
  content: string;
  aiContent?: string;
  memoryId?: string;
  action?: Action;
  role: MessageRole;
}

/* ================= QUERY PARAMS ================= */
export interface MessageQueryParams {
  limit?: number;
  memoryId?: string;
  userId?: string;
}