// In dieser Datei definieren wir die Funktion für den API-Aufruf.

export const getLlamaAnalysis = async (prompt: string): Promise<string> => {
  const apiKey = process.env.LLAMA_API_KEY; // Zugriff auf den API-Schlüssel

  if (!apiKey) {
    throw new Error("Llama API key is not defined.");
  }

  // Die URL des API-Endpunkts hängt vom gewählten Anbieter ab.
  // Dies ist ein Beispiel für einen fiktiven Endpunkt.
  // Bitte passen Sie die URL entsprechend an.
  const apiUrl = "https://api.llama-provider.com/v1/chat/completions";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3-8b-chat-hf", // Beispiel-Modell
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    // Der genaue Pfad zur Antwort kann je nach API-Anbieter variieren.
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching Llama analysis:", error);
    throw error;
  }
};