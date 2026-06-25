
import { MemoryService } from "./memory.service";
import { HuggingFaceResponseService } from "./huggingfaceresponse.service";
import {MessageService} from "./message.service";
import { UpdateMemoryInput} from "../types/memory.types";

const huggingfaceresponse = new HuggingFaceResponseService();
const messageService = new MessageService();

export interface NLPResult {
 intent:
  | "CREATE_MEMORY"
  | "RETRIEVE_MEMORY"
  | "UPDATE_MEMORY"
  | "DELETE_MEMORY";

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
    case "CREATE_MEMORY": {

    console.log("CREATE_MEMORY service called");
    
    if (!data.title || !data.description) {
       throw new Error("Missing required entities");
     }

    await MemoryService.createMemory({
      userId: data.userId,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      publicId: data.publicId,
      latitude: data.latitude,
      longitude: data.longitude,
      memoryId: data.memoryId,
    });

    const message = `Got it — I’ve saved ${data.title}. You can ask me anytime using a short description, and I’ll recall it for you.`;
    
    await messageService.createMessage({
      userId: data.userId,
      role: "assistant",
      content: message,
      aiContent: message,
    });

    return {
        status: "CREATED",
        reply: message,
        memories: [],
    };
  }

  case "RETRIEVE_MEMORY": {
    console.log("RETRIEVE_MEMORY service called");

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
      createdat:memory.createdAt??undefined,
    }));

    console.log(
      "Memories retrieved ",
      formattedMemories
    );

    const aiResponse =
      await huggingfaceresponse.generateResponse(
        "RETRIEVE_MEMORY",
        usertext,
        formattedMemories
      );

    console.log("AI Response:", aiResponse);

    await messageService.createMessage({
      userId: data.userId,
      role: "assistant",
      content: aiResponse.reply,
      aiContent: JSON.stringify(aiResponse),
    });

    return aiResponse;
  }

  case "UPDATE_MEMORY": {
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
        await huggingfaceresponse.generateResponse(
          "UPDATE_MEMORY",
          usertext,
          formattedMemories
        );

      console.log("AI Response:", aiResponse);

      await messageService.createMessage({
        userId: data.userId,
        role: "assistant",
        content: aiResponse.reply,
        aiContent: JSON.stringify(aiResponse),
      });

      return aiResponse;
    }

    const updatePayload: UpdateMemoryInput = {
      memoryId: data.memoryId,
      title: data.title,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
    };

    await MemoryService.updateMemory(
      data.memoryId,
      data.userId,
      updatePayload
    );

    const message ="memory with ${data.title} and is updated ";
    

    return {
      status: "UPDATED",
      reply: message,
      memories: [],
    };
  }

  case "DELETE_MEMORY": {
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
        await huggingfaceresponse.generateResponse(
          "DELETE_MEMORY",
          usertext,
          formattedMemories
        );

      console.log(aiResponse);

      await messageService.createMessage({
        userId: data.userId,
        role: "assistant",
        content: aiResponse.reply,
        aiContent: JSON.stringify(aiResponse),
      });

      return aiResponse;
    }

    await MemoryService.deleteMemory(
      data.memoryId,
      data.userId
    );

    console.log(
      `Memory with ID ${data.memoryId} deleted successfully.`
    );

    const message = `${data.title} has been removed from my memory successfully.`;

    await messageService.createMessage({
      userId: data.userId,
      role: "assistant",
      content: message,
      aiContent: message,
    });

    return {
      status: "CREATED",
      reply: message,
      memories: [],
    };
  }

  default: {
    throw new Error(`Unsupported intent: ${data.intent}`);
  }
}
  }
}
