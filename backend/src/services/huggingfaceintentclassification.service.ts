import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(
  process.env.HUGGINGFACE_API_KEY as string
);

export class HuggingFaceService {
  async extractEntities(data: unknown) {
    const prompt = `
You are an NLP intent classification and entity extraction engine.

Return ONLY valid JSON.
Do not return markdown.
Do not return explanations.
Do not wrap output in \`\`\`.

Possible intents:
- CREATE_MEMORY
- RETRIEVE_MEMORY
- UPDATE_MEMORY
- DELETE_MEMORY
- CHAT

Rules:
1. Determine the correct intent.
2. Extract entities when applicable.
3. If the user is simply chatting, use CHAT and respond naturally.
4. Always return valid JSON.
5. The input may contain the current user message and up to 5 previous conversation messages.
6. Use previous messages only when they are relevant to understanding the current user message.
7. If the current message is independent, ignore the previous messages completely please consider this strictly.
8. Never let previous messages override the user's current request.
9.if most of the time remeber this object means it is create intent 
10.if it is  what things that you have remembered means or useing word where  is retrive
11.If the use says can you find this implies the the intent is retrive
12. For CREATE_MEMORY, the description should strictly be the physical or textual description of where the item was placed, as described in the user's message (e.g., "in the drawer", "on the table"). Never include image URLs, Cloudinary public IDs, latitude, or longitude coordinates in the description. If no textual description is provided in the message, leave the description empty.

Input:
${JSON.stringify(data)}

For CREATE_MEMORY, RETRIEVE_MEMORY, UPDATE_MEMORY, DELETE_MEMORY:

{
  "intent": "CREATE_MEMORY",
  "entities": {
    "title": "object name",
    "description": "description of the location",
    "memoryId": "optional"
  }
}

For CHAT:

{
  "status": "CHAT",
  "reply": "natural conversational response"
} "memories":[]
`;

    const response = await client.chatCompletion({
      model: "Qwen/Qwen3-8B",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0,
      max_tokens: 3000,
    });

    return response.choices[0].message.content;
  }
}