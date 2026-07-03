export class AIService {
  async extractEntities(data: unknown, timeoutMs = 15000) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

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
9. If the user says "remember", it is usually CREATE_MEMORY.
10. If the user asks "what things have you remembered", it is RETRIEVE_MEMORY.
11. If the user says "can you find", it implies RETRIEVE_MEMORY.

Input:
${JSON.stringify(data)}

For CREATE_MEMORY, RETRIEVE_MEMORY, UPDATE_MEMORY, DELETE_MEMORY:

{
  "intent": "CREATE_MEMORY",
  "entities": {
    "title": "object name",
    "description": "description",
    "memoryId": "optional"
  }
}

For CHAT:

{
  "status": "CHAT",
  "reply": "natural conversational response",
  "memories": []
}
`;

    // Tie an AbortController to the timeout so the actual HTTP
    // request gets cancelled, not just "given up on" by our code.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0,
              maxOutputTokens: 3000,
            },
          }),
          signal: controller.signal,
        }
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
         const timeoutError = new Error("AI_TIMEOUT");
        (timeoutError as Error & { cause?: unknown }).cause = err;
      }
      throw err; // network error, DNS failure, etc.
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText} ${errorBody}`
      );
    }

    const result = await response.json();

    // Surface safety blocks / prompt-level rejection clearly
    if (result.promptFeedback?.blockReason) {
      throw new Error(
        `Gemini blocked the prompt: ${result.promptFeedback.blockReason}`
      );
    }

    const candidate = result.candidates?.[0];

    if (!candidate) {
      throw new Error("Gemini returned no candidates");
    }

    if (candidate.finishReason && candidate.finishReason !== "STOP") {
      console.warn(
        `Gemini finishReason was "${candidate.finishReason}" (expected STOP) — response may be truncated or filtered`
      );
    }

    return candidate.content?.parts?.[0]?.text ?? "";
  }
}