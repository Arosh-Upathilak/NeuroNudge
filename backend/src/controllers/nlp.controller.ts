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
    res: Response
  ) => {
    try {
      const { userText, latitude, longitude } = req.body;
      const userId = req.user!.uid;

      let imageUrl: string | null = null;
      let publicId: string | null = null;

      // STEP 1: upload image (only if exists)
      const imageUploadPromise = req.file?.path
        ? cloudinaryService.uploadImage(req.file.path)
        : Promise.resolve(null);

      // STEP 2: save user message (non-blocking but tracked)
      const saveUserMessagePromise = messageService.createMessage({
        userId,
        role: "user",
        content: userText,
        aiContent: userText,
      });

      // STEP 3: fetch previous messages in parallel
      const previousMessagesPromise =
        messageService.getMessagesByUser(userId);

      // WAIT ONLY FOR WHAT WE NEED FOR LLM
      const [uploadResult, previousMessages] = await Promise.all([
        imageUploadPromise,
        previousMessagesPromise,
      ]);

      // assign image results
      if (uploadResult) {
        imageUrl = uploadResult.imageUrl;
        publicId = uploadResult.publicId;
      }

      console.log(previousMessages);

      // STEP 4: build LLM input (NOW READY)
      const llmInput = {
        currentMessage: {
          text: userText,
          imageUrl,
          publicId,
          latitude,
          longitude,
          
        },
        previousMessages,
      };

      // STEP 5: call LLM
      const aiResponse = await huggingface.extractEntities(llmInput);

      if (!aiResponse) {
        return res.status(400).json({
          success: false,
          message: "returned an empty response",
        });
      }

      console.log("Raw model Response:", aiResponse);

      const cleaned = aiResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      let parsed;

      try {
        parsed = JSON.parse(cleaned);
      } catch  {
        
        return res.status(400).json({
          success: false,
          message: "Invalid JSON returned from model",
          rawResponse: cleaned,
        });
      }

      // STEP 6: CHAT path (fast response)
      if (parsed.intent === "CHAT") {
        const assistantMessagePromise = messageService.createMessage({
          userId,
          role: "assistant",
          content: parsed.reply,
          aiContent: JSON.stringify(parsed),
        });

          await Promise.all([
          saveUserMessagePromise,
          assistantMessagePromise,
         ]);

        return res.status(200).json({
          success: true,
          data:parsed
        });
      }

      // STEP 7: memory routing
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

      console.log("Parsed model Response:", memoryData);

      const result = await IntentRouterService.route(
        memoryData,
        userText
      );

      // optional: wait user message save if not completed
      await saveUserMessagePromise;

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: unknown) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Internal Server Error",
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