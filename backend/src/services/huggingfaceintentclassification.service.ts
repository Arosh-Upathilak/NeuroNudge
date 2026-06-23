import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(
  process.env.HUGGINGFACE_API_KEY as string
);

export class HuggingFaceService {
  async extractEntities(data: any) {
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
7. If the current message is independent, ignore the previous messages completely.
8. Never let previous messages override the user's current request.
9.if most of the time remeber this object means it is create intent 
10.if it is  what things that you have remembered means the intent is retrive

Input:
${JSON.stringify(data)}

For CREATE_MEMORY, RETRIEVE_MEMORY, UPDATE_MEMORY, DELETE_MEMORY:

{
  "intent": "CREATE_MEMORY",
  "entities": {
    "title": "memory title",
    "description": "memory description",
    "memoryId": "optional"
  }
}

For CHAT:

{
  "intent": "CHAT",
  "reply": "natural conversational response"
}
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