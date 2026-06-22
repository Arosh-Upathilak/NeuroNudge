
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY as string,
});

export interface MemoryResponse {
  memoryId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  publicId?: string;
  latitude?: number;
  longitude?: number;
}

export interface AIResponse {
  status: "FOUND" | "MULTIPLE_MATCHES" | "NOT_FOUND";
  reply: string;
  memories?: MemoryResponse[];
}

export class GeminiResponseService {
  async generateResponse(
    intent: string,
    question: string,
    memories: MemoryResponse[]
  ): Promise<AIResponse> {
    const prompt = `
You are a memory assistant.

Use ONLY the memories provided below.
Never invent information.

Intent: ${intent}

Question:
${question}

Memories:
${JSON.stringify(memories)}

Instructions:
- If exactly one memory matches, use status FOUND.
- If multiple memories match, use status MULTIPLE_MATCHES and ask the user which one they mean.
- If no memory matches, use status NOT_FOUND.
- For UPDATE_MEMORY and DELETE_MEMORY, ask for confirmation before proceeding when a match is found.
- Return ONLY valid JSON.
- Do not wrap the response in markdown.

Return this exact schema:

{
  "status": "FOUND | MULTIPLE_MATCHES | NOT_FOUND",
  "reply": "natural language response",
  "memories": [
    {
      "memoryId": "string",
      "title": "string",
      "description": "string",
      "imageUrl": "string",
      "publicId": "string",
      "latitude": 0,
      "longitude": 0
    }
  ]
}
`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = response.text?.trim() || "";

      const cleanedText = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      return JSON.parse(cleanedText) as AIResponse;
    } catch (error) {
      console.error("Gemini Response Error:", error);

      return {
        status: "NOT_FOUND",
        reply: "Sorry, I couldn't process your request.",
        memories: [],
      };
    }
  }
}

