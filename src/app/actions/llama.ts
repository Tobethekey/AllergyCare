'use server';

import { z } from 'zod';

// Schema zur Validierung der erwarteten JSON-Antwort von der API
const analysisResultSchema = z.object({
  possibleTriggers: z.array(z.string()),
  explanation: z.string(),
});

export async function analyzeWithLlama(prompt: string) {
  const apiKey = process.env.LLAMA_API_KEY;

  // Fallback für Entwicklung/Testing ohne API-Schlüssel
  if (!apiKey) {
    console.warn("Llama API key is not configured. Using mock response for development.");
    
    // Mock-Response für Entwicklung
    return {
      possibleTriggers: ["Paprika", "Nudelauflauf"],
      explanation: "Basierend auf den Daten scheinen Paprika und Nudelauflauf häufig mit Magen-Darm-Symptomen in Verbindung zu stehen. Bitte konsultieren Sie einen Arzt für eine professionelle Diagnose."
    };
  }

  // KORRIGIERTE API-URLs für verschiedene Anbieter
  const apiProviders = [
    // OpenAI-kompatible API (z.B. Together AI, Replicate, etc.)
    {
      url: "https://api.together.xyz/v1/chat/completions",
      model: "meta-llama/Llama-2-7b-chat-hf"
    },
    // Fallback zu OpenAI (falls verfügbar)
    {
      url: "https://api.openai.com/v1/chat/completions", 
      model: "gpt-3.5-turbo"
    }
  ];

  for (const provider of apiProviders) {
    try {
      const response = await fetch(provider.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [{ 
            role: "user", 
            content: prompt 
          }],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`API Error (${provider.url}):`, errorBody);
        continue; // Versuche nächsten Provider
      }

      const data = await response.json();
      const resultText = data.choices[0].message.content;

      // Versuche JSON zu parsen
      try {
        const parsedJson = JSON.parse(resultText);
        const validatedResult = analysisResultSchema.parse(parsedJson);
        return validatedResult;
      } catch (parseError) {
        // Wenn JSON-Parsing fehlschlägt, extrahiere die Informationen manuell
        console.warn("JSON parsing failed, extracting information manually:", parseError);
        
        return {
          possibleTriggers: extractTriggers(resultText),
          explanation: resultText.substring(0, 300) + "..." // Beschränke die Länge
        };
      }

    } catch (error) {
      console.error(`Error with provider ${provider.url}:`, error);
      continue; // Versuche nächsten Provider
    }
  }

  // Fallback wenn alle Provider fehlschlagen
  throw new Error("Failed to get analysis from AI service. All providers failed.");
}

// Hilfsfunktion zum Extrahieren von Auslösern aus dem Text
function extractTriggers(text: string): string[] {
  const triggers: string[] = [];
  const foodMentions = text.match(/\b(Paprika|Nudelauflauf|Apfel|Banane|Milch|Ei|Nuss|Weizen|Soja|Fisch|Meeresfrüchte|Erdnuss|Tomate|Zitrus|Schokolade|Käse|Brot|Fleisch|Reis|Kartoffel|Zwiebel|Knoblauch|Gewürz|Kräuter|Öl|Butter|Zucker|Honig|Joghurt|Quark|Sahne|Mandel|Haselnuss|Walnuss|Cashew|Sesam|Senf|Sellerie|Petersilie|Dill|Basilikum|Oregano|Thymian|Rosmarin|Paprika|Pfeffer|Chili|Curry|Ingwer|Zimt|Vanille|Kakao|Kaffee|Tee|Alkohol|Bier|Wein|Limonade|Saft|Wasser)\b/gi);
  
  if (foodMentions) {
    triggers.push(...foodMentions.map(item => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()));
  }
  
  return [...new Set(triggers)]; // Entferne Duplikate
}
