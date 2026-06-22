
import { MemoryService } from "./memory.service";
import { GeminiResponseService } from "./geminiresponse.service";

const geminiResponseService = new GeminiResponseService();

export interface NLPResult {
  intent:
    | "CREATE_MEMORY"
    | "RETRIEVE_MEMORY"
    | "UPDATE_MEMORY"
    | "DELETE_MEMORY"
    | "CHAT";

  userId: string;
  title?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  publicId?: string;
  memoryId?: string;
}

export class IntentRouterService {
  static async route(data: NLPResult, usertext: string) {
    switch (data.intent) {
      case "CREATE_MEMORY":
        console.log("CREATE_MEMORY service called");

        const result = await MemoryService.createMemory({
          userId: data.userId,
          title: data.title!,
          description: data.description,
          imageUrl: data.imageUrl,
          publicId: data.publicId,
          latitude: data.latitude,
          longitude: data.longitude,
          memoryId: data.memoryId,
        });

        console.log("Memory created:", result);
        return result;

      case "RETRIEVE_MEMORY":
         const available = await MemoryService.getMemoriesByUser(
            data.userId
          );

          const formattedMemories = available.map((memory) => ({
            memoryId: memory.memoryId,
            title: memory.title,
            description: memory.description ?? undefined,
            imageUrl: memory.image?.imageUrl ?? undefined,
            publicId: memory.image?.publicId ?? undefined,
            latitude: memory.location?.latitude ?? undefined,
            longitude: memory.location?.longitude ?? undefined,
          }));

          console.log(
            "Memories retrieved for update:",
            formattedMemories
          );

          const aiResponse =
            await geminiResponseService.generateResponse(
              "UPDATE_MEMORY",
              usertext,
              formattedMemories
            );

          console.log("AI Response:", aiResponse);

          return aiResponse;        

      case "UPDATE_MEMORY":
        console.log("UPDATE_MEMORY service called");

        if (!data.memoryId) {
          const available = await MemoryService.getMemoriesByUser(
            data.userId
          );

          const formattedMemories = available.map((memory) => ({
            memoryId: memory.memoryId,
            title: memory.title,
            description: memory.description ?? undefined,
            imageUrl: memory.image?.imageUrl ?? undefined,
            publicId: memory.image?.publicId ?? undefined,
            latitude: memory.location?.latitude ?? undefined,
            longitude: memory.location?.longitude ?? undefined,
          }));

          console.log(
            "Memories retrieved for update:",
            formattedMemories
          );

          const aiResponse =
            await geminiResponseService.generateResponse(
              "UPDATE_MEMORY",
              usertext,
              formattedMemories
            );

          console.log("AI Response:", aiResponse);

          return aiResponse;
        } else {
          // TODO: Replace with updateMemory later
          await MemoryService.deleteMemory(
            data.memoryId,
            data.userId
          );

          console.log(
            `Memory with ID ${data.memoryId} processed successfully.`
          );

          return {
            success: true,
            memoryId: data.memoryId,
          };
        }

      case "DELETE_MEMORY":
        console.log("DELETE_MEMORY service called");

        if (!data.memoryId) {
          const available = await MemoryService.getMemoriesByUser(
            data.userId
          );

          const formattedMemories = available.map((memory) => ({
            memoryId: memory.memoryId,
            title: memory.title,
            description: memory.description ?? undefined,
            imageUrl: memory.image?.imageUrl ?? undefined,
            publicId: memory.image?.publicId ?? undefined,
            latitude: memory.location?.latitude ?? undefined,
            longitude: memory.location?.longitude ?? undefined,
          }));

          console.log(
            "Memories retrieved for deletion:",
            formattedMemories
          );

          const aiResponse =
            await geminiResponseService.generateResponse(
              "DELETE_MEMORY",
              usertext,
              formattedMemories
            );

          console.log("AI Response:", aiResponse);

          return aiResponse;
        } else {
          await MemoryService.deleteMemory(
            data.memoryId,
            data.userId
          );

          console.log(
            `Memory with ID ${data.memoryId} deleted successfully.`
          );

          return {
            success: true,
            memoryId: data.memoryId,
          };
        }

      case "CHAT":
        console.log("CHAT service called");
        console.log(data);

        return {
          reply: "Chat response will be implemented later.",
        };

      default:
        throw new Error(
          `Unsupported intent: ${data.intent}`
        );
    }
  }
}
