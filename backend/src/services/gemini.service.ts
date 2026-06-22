import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY as string,
});

export class GeminiService {
  async extractEntities(data: any) {
   const prompt = `
You are an NLP intent classification and entity extraction engine.

Return ONLY valid JSON. No markdown, no explanation.

Possible intents:
- CREATE_MEMORY
- RETRIEVE_MEMORY
- UPDATE_MEMORY
- DELETE_MEMORY
- CHAT

Rules:
1. Identify the correct intent from the input.
2. Extract relevant entities if present.
3. If intent is CHAT 
   - behave like a normal assistant
   - generate a natural conversational reply
   - DO NOT force entity structure

Input:
${JSON.stringify(data)}

Output format:

If intent is NOT CHAT:
{
  "intent": "CREATE_MEMORY",
  "entities": {
    "title": "purse",
    "description": "table"
    "memoryId": "optional, neglect this if you are unable to extract it"
  }
}

If intent IS CHAT 
{
  "intent": "CHAT",
  "reply": "your natural assistant response here"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text;
  }
}