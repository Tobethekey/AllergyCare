'use server';

import { z } from 'zod';

// Schema zur Validierung der erwarteten JSON-Antwort von der API
const analysisResultSchema = z.object({
  possibleTriggers: z.array(z.string()),
  explanation: z.string(),
});

export async function analyzeWithLlama(prompt: string) {
  const apiKey = process.env.LLAMA_API_KEY;

  if (!apiKey) {
    throw new Error("Llama API key is not configured on the server.");
  }

  // Passen Sie diese URL an den von Ihnen gewählten Anbieter an
  const apiUrl = "https://api.llama-provider.com/v1/chat/completions";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3-8b-chat-hf", // Beispiel-Modell anpassen
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }, // Fordert eine JSON-Antwort an
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Llama API Error:", errorBody);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;

    // Parsen und validieren Sie die JSON-Antwort
    const parsedJson = JSON.parse(resultText);
    const validatedResult = analysisResultSchema.parse(parsedJson);

    return validatedResult;

  } catch (error) {
    console.error("Error in analyzeWithLlama:", error);
    // Werfen Sie einen allgemeinen Fehler, um keine internen Details preiszugeben
    throw new Error("Failed to get analysis from AI service.");
  }
}