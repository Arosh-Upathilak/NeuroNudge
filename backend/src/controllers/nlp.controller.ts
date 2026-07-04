import { Response } from "express";
import fs from "fs";
import { CloudinaryService } from "../services/image.service";
import { HuggingFaceService } from "../services/huggingfaceintentclassification.service";
import { AuthRequest } from "../types/auth.types";
import { ProcessMessageInput } from "../types/nlp.types";
import { IntentRouterService } from "../services/intentroute.service";
import { MessageService } from "../services/message.service";

const cloudinaryService = new CloudinaryService();
const huggingface = new HuggingFaceService();
const messageService = new MessageService();

export const NLPController = {
  processMessage: async (
    req: AuthRequest<{ id: string }, unknown, ProcessMessageInput>,
    res: Response,
  ) => {
    try {
      const { userText, latitude, longitude } = req.body;
      const userId = req.user!.uid;

      let imageUrl: string | null = null;
      let publicId: string | null = null;

      const imageUploadPromise = req.file?.path
        ? cloudinaryService.uploadImage(req.file.path)
        : Promise.resolve(null);

      const saveUserMessagePromise = messageService.createMessage({
        userId,
        role: "user",
        content: userText,
        aiContent: userText,
      });

      const previousMessagesPromise = messageService.getMessagesByUser(userId);

      const [uploadResult, previousMessages] = await Promise.all([
        imageUploadPromise,
        previousMessagesPromise,
      ]);

      if (uploadResult) {
        imageUrl = uploadResult.imageUrl;
        publicId = uploadResult.publicId;
      }

      const llmInput = {
        currentMessage: {
          text: userText,
        },
        previousMessages,
      };

      const aiResponse = await huggingface.extractEntities(llmInput);

      if (!aiResponse) {
        return res.status(400).json({
          success: false,
          message: "returned an empty response",
        });
      }

      const cleaned = aiResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      let parsed;

      try {
        parsed = JSON.parse(cleaned);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON returned from model",
          rawResponse: cleaned,
        });
      }

      if (parsed.intent === "CHAT") {
        const assistantMessagePromise = messageService.createMessage({
          userId,
          role: "assistant",
          content: parsed.reply,
          aiContent: JSON.stringify(parsed),
        });

        await Promise.all([saveUserMessagePromise, assistantMessagePromise]);

        return res.status(200).json({
          success: true,
          data: parsed,
        });
      }

      const memoryData = {
        intent: parsed.intent,
        userId,
        title: parsed.entities?.title,
        description: parsed.entities?.description,
        latitude: latitude ? Number(latitude) : undefined,
        longitude: longitude ? Number(longitude) : undefined,
        imageUrl: imageUrl ?? undefined,
        publicId: publicId ?? undefined,
        memoryId: parsed.entities?.memoryId,
      };

      const result = await IntentRouterService.route(memoryData, userText);

      await saveUserMessagePromise;

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    } finally {
      if (req.file?.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error("Failed to delete temp file:", err);
        }
      }
    }
  },
};
