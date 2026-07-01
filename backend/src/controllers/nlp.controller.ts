import { Response } from "express";
import { CloudinaryService } from "../services/image.service";
import { AIService } from "../services/AIIntententclassification.service";
import { AuthRequest } from "../types/auth.types";
import { ProcessMessageInput } from "../types/nlp.types";
import { IntentRouterService } from "../services/intentroute.service";
import { MessageService } from "../services/message.service";
import { performance } from "perf_hooks";

const cloudinaryService = new CloudinaryService();
const aiService = new AIService();
const messageService = new MessageService();

export const NLPController = {
  processMessage: async (
    req: AuthRequest<{ id: string }, unknown, ProcessMessageInput>,
    res: Response
  ) => {
    const requestStart = performance.now();

    try {
      const { userText, latitude, longitude } = req.body;
      const userId = req.user!.uid;

      console.log("\n========== REQUEST START ==========");

      // ─── PHASE 1 ───────────────────────────────────────────────────────────
      // Kick off image upload immediately (if file present).
      // Do NOT await yet — let it run in the background.
      const uploadStart = performance.now();
      const imageUploadPromise = req.file?.path
        ? cloudinaryService.uploadImage(req.file.path)
        : Promise.resolve(null);

      // ─── PHASE 2 ───────────────────────────────────────────────────────────
      // As soon as upload is kicked off, also kick off fetchPreviousMessages.
      // Both image upload + fetch run in parallel.
      // We await BOTH together so neither blocks the other.
      const fetchMessagesStart = performance.now();
      const previousMessagesPromise = messageService.getMessagesByUser(userId);

      const [uploadResult, previousMessages] = await Promise.all([
        imageUploadPromise,
        previousMessagesPromise,
      ]);

      console.log(
        `Cloudinary Upload: ${(performance.now() - uploadStart).toFixed(2)} ms`
      );
      console.log(
        `Fetch Previous Messages: ${(performance.now() - fetchMessagesStart).toFixed(2)} ms`
      );
      console.log(`Previous Messages Count: ${previousMessages.length}`);

      // Resolve image result
      const imageUrl: string | null = uploadResult?.imageUrl ?? null;
      const publicId: string | null = uploadResult?.publicId ?? null;

      // ─── PHASE 3 ───────────────────────────────────────────────────────────
      // Build LLM input now that we have both image URL and previous messages.
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

      // Fire off LLM call — this will take the longest.
      // SIMULTANEOUSLY, kick off saving the user message so DB write
      // happens during the LLM wait time instead of after.
      const llmStart = performance.now();
      const aiResponsePromise = aiService.extractEntities(llmInput);

      const saveUserMessageStart = performance.now();
      const saveUserMessagePromise = messageService.createMessage({
        userId,
        role: "user",
        content: userText,
        aiContent: userText,
      });

      saveUserMessagePromise.finally(() => {
        console.log(
          `Save User Message: ${(performance.now() - saveUserMessageStart).toFixed(2)} ms`
        );
      });

      // Await LLM — user message save runs in parallel during this wait
      const aiResponse = await aiResponsePromise;

      console.log(
        `LLM Call: ${(performance.now() - llmStart).toFixed(2)} ms`
      );

      if (!aiResponse) {
        console.log(
          `TOTAL REQUEST TIME: ${(performance.now() - requestStart).toFixed(2)} ms`
        );
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
      } catch {
        console.log(
          `TOTAL REQUEST TIME: ${(performance.now() - requestStart).toFixed(2)} ms`
        );
        return res.status(400).json({
          success: false,
          message: "Invalid JSON returned from model",
          rawResponse: cleaned,
        });
      }

      // ─── CHAT PATH ─────────────────────────────────────────────────────────
      if (parsed.intent === "CHAT") {
        const assistantSaveStart = performance.now();

        // Save assistant reply — fire and don't block the response
        const assistantMessagePromise = messageService.createMessage({
          userId,
          role: "assistant",
          content: parsed.reply,
          aiContent: JSON.stringify(parsed),
        });

        assistantMessagePromise.finally(() => {
          console.log(
            `Assistant Message Save: ${(performance.now() - assistantSaveStart).toFixed(2)} ms`
          );
        });

        // Ensure user message is saved before we exit
        await saveUserMessagePromise;

        console.log(
          `TOTAL REQUEST TIME: ${(performance.now() - requestStart).toFixed(2)} ms`
        );
        console.log("=========== REQUEST END ===========\n");

        return res.status(200).json({
          success: true,
          data: parsed,
        });
      }

      // ─── MEMORY PATH ───────────────────────────────────────────────────────
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

      const routerStart = performance.now();

      // Run intent router and wait for user message save in parallel —
      // both can complete concurrently before we respond
      const [result] = await Promise.all([
        IntentRouterService.route(memoryData, userText),
        saveUserMessagePromise,
      ]);

      console.log(
        `Intent Router: ${(performance.now() - routerStart).toFixed(2)} ms`
      );

      console.log(
        `TOTAL REQUEST TIME: ${(performance.now() - requestStart).toFixed(2)} ms`
      );
      console.log("=========== REQUEST END ===========\n");

      return res.status(200).json({
        success: true,
        data: result,
      });

    } catch (error: unknown) {
      console.error(error);
      console.log(
        `TOTAL REQUEST TIME (FAILED): ${(performance.now() - requestStart).toFixed(2)} ms`
      );
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Internal Server Error",
      });
    }
  },
};