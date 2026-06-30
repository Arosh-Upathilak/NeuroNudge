import { MessageRole } from "@prisma/client";
import prisma from "../config/prisma";
import { CreateMessageInput, UpdateMessageInput } from "../types/message.types";

export class MessageService {
  /* ================= CREATE MESSAGE ================= */
  async createMessage(data: CreateMessageInput) {
    return prisma.message.create({
      data: {
        userId: data.userId,
        role: data.role as MessageRole,
        content: data.content,
        aiContent: data.aiContent ?? null,
      },
    });
  }

  /* ================= UPDATE MESSAGE ================= */
  async updateMessage(data: UpdateMessageInput) {
    return prisma.message.update({
      where: { messageId: data.messageId },
      data: {
        content: data.content,
        aiContent: data.aiContent ?? null,
      },
    });
  }

  /* ================= GET USER MESSAGES ================= */
  async getMessagesByUser(userId: string, limit = 5) {
    return prisma.message.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        aiContent: true,
      },
    });
  }

  /* ================= GET MEMORY MESSAGES ================= */

  /* ================= DELETE MESSAGE ================= */
  async deleteMessage(messageId: string) {
    return prisma.message.delete({
      where: { messageId },
    });
  }

  async getMessagesByUserForchat(userId: string) {
    return prisma.message.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}
