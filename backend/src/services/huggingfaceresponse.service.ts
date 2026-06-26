import { InferenceClient } from "@huggingface/inference";

const hfKey = process.env.HUGGINGFACE_API_KEY;
const client = new InferenceClient(hfKey || undefined);

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

export class HuggingFaceResponseService {
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
      if (!hfKey || !hfKey.startsWith("hf_")) {
        console.warn("HuggingFaceResponseService: Missing or invalid HUGGINGFACE_API_KEY, returning mock response.");
        return {
          status: memories.length > 0 ? "FOUND" : "NOT_FOUND",
          reply: memories.length > 0 ? "I found a match in your memories based on your request." : "Sorry, I couldn't find a matching memory.",
          memories: memories.length > 0 ? [memories[0]] : []
        };
      }

      const response = await client.chatCompletion({
        model: "Qwen/Qwen2.5-72B-Instruct",
        messages: [
          {
            role: "system",
            content:
              "You are a memory assistant that always returns valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 3000
      });

      const text =
        response.choices?.[0]?.message?.content?.trim() || "";

      const cleanedText = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      return JSON.parse(cleanedText) as AIResponse;
    } catch (error) {
      console.error("HuggingFace Response Error:", error);

      return {
        status: "NOT_FOUND",
        reply: "Sorry, I couldn't process your request.",
        memories: [],
      };
    }
  }
}