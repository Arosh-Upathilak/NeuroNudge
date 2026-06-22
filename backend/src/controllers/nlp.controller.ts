import { Response } from "express";
import { CloudinaryService } from "../services/image.service";
import { GeminiService } from "../services/gemini.service";
import { AuthRequest } from "../types/auth.types";
import { ProcessMessageInput } from "../types/nlp.types";
import { IntentRouterService } from "../services/intentroute.service";

const cloudinaryService = new CloudinaryService();
const geminiService = new GeminiService();

export const NLPController = {
  processMessage: async (
    req: AuthRequest<{id: string }, unknown, ProcessMessageInput>,
    res: Response
  ) => {
    try {
      const { userText, latitude, longitude } = req.body;
      const userId = req.user!.uid;

      let imageUrl: string | null = null;
      let publicId: string | null = null;

      if (req.file?.path) {
        const uploadResult = await cloudinaryService.uploadImage(
          req.file.path
        );

        imageUrl = uploadResult.imageUrl;
        publicId = uploadResult.publicId;
      }

      const llmInput = {
        currentMessage: {
          text: userText,
          imageUrl,
          publicId,
          timestamp: new Date().toISOString(),
        },
      };

      const aiResponse = await geminiService.extractEntities(llmInput);

      if (!aiResponse) {
        return res.status(400).json({
          success: false,
          message: "Gemini returned an empty response",
        });
      }

      const cleaned = aiResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleaned);

     const memoryData = {
      intent: parsed.intent,
      userId: req.user!.uid,
      title: parsed.entities?.title,
      description: parsed.entities?.description,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      imageUrl: imageUrl ?? undefined,
      publicId: publicId ?? undefined,
      memoryId: parsed.entities?.memoryId,
      };
      console.log("Parsed Gemini response:", memoryData);//Need to be removed later, just for debugging
     const gemineresponse=await IntentRouterService.route(memoryData,userText);
      return res.status(200).json({
        success: true,
        data: gemineresponse,
      });
    } catch (error: unknown) {
      return res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  },
};