import { Response } from "express";
import { AuthRequest } from "../types/auth.types";
import { MessageService } from "../services/message.service";
import { CreateMessageRequestBody } from "../types/message.types";
import { MessageRole } from "@prisma/client";

const messageService = new MessageService();

/* ================= PARAM HELPER ================= */
const toString = (v: string | string[]) =>
  Array.isArray(v) ? v[0] : v;

export const MessageController = {
  /* ================= CREATE MESSAGE ================= */
  createMessage: async (
    req: AuthRequest<{}, {}, CreateMessageRequestBody>,
    res: Response
  ) => {
    try {
      const userId = req.user!.uid;

      const role = req.body.role;

      // ✅ SAFE ENUM VALIDATION
      if (!Object.values(MessageRole).includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid message role",
        });
      }

      const message = await messageService.createMessage({
        userId,
        role,
        content: req.body.content,
        aiContent: req.body.aiContent,
       
      });

      return res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  /* ================= GET USER MESSAGES ================= */
  getUserMessages: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.uid;

      const messages = await messageService.getMessagesByUserForchat(userId);

      return res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  /* ================= GET MEMORY MESSAGES ================= */
  getMemoryMessages: async (req: AuthRequest, res: Response) => {
    try {
      const memoryId = toString(req.params.memoryId);

      const messages = await messageService.getMessagesByMemory(memoryId);

      return res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  /* ================= DELETE MESSAGE ================= */
  deleteMessage: async (req: AuthRequest, res: Response) => {
    try {
      const messageId = toString(req.params.messageId);

      await messageService.deleteMessage(messageId);

      return res.status(200).json({
        success: true,
        message: "Message deleted successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};