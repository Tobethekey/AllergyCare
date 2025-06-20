'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getFormattedLogsForAI, getAiSuggestions, saveAiSuggestions, clearAiSuggestions, getFoodEntries, getSymptomEntries } from '@/lib/data-service';
import { AlertTriangle, CheckCircle2, Wand2, Info } from 'lucide-react';
import { analyzeWithLlama } from '@/app/actions/llama';

interface AnalysisResult {
  possibleTriggers: string[];
  explanation: string;
}

export function AiAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [dataStats, setDataStats] = useState<{foodCount: number, symptomCount: number}>({foodCount: 0, symptomCount: 0});

  useEffect(() => {
    const storedAnalysis = getAiSuggestions();
    if (storedAnalysis) {
      setAnalysisResult(storedAnalysis);
    }
    
    // Lade Datenstatistiken
    const foodEntries = getFoodEntries();
    const symptomEntries = getSymptomEntries();
    setDataStats({
      foodCount: foodEntries.length,
      symptomCount: symptomEntries.length
    });
  }, []);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    // --- START ERWEITERTE DEBUGGING ---
    if (typeof window !== 'undefined') {
        const rawFood = window.localStorage.getItem('ALLERGYCARE_FOOD_LOGS');
        const rawSymptoms = window.localStorage.getItem('ALLERGYCARE_SYMPTOM_LOGS');
        console.log("=== DEBUGGING KI-ANALYSE ===");
        console.log("Rohdaten für 'ALLERGYCARE_FOOD_LOGS':", rawFood);
        console.log("Rohdaten für 'ALLERGYCARE_SYMPTOM_LOGS':", rawSymptoms);
        
        if (rawFood) {
          const foodData = JSON.parse(rawFood);
          console.log("Parsed Food Data:", foodData);
          console.log("Food Einträge Anzahl:", foodData.length);
        }
        
        if (rawSymptoms) {
          const symptomData = JSON.parse(rawSymptoms);
          console.log("Parsed Symptom Data:", symptomData);
          console.log("Symptom Einträge Anzahl:", symptomData.length);
        }
    }
    // --- END DEBUGGING ---

    const { foodLog, symptomLog } = getFormattedLogsForAI();
    
    // Erweiterte Debugging-Ausgaben
    console.log("=== FORMATIERTE DATEN FÜR KI ===");
    console.log("Food Log:", foodLog);
    console.log("Symptom Log:", symptomLog);

    if (!foodLog || !symptomLog) {
      setError(`Unzureichende Daten für die Analyse. Aktuell: ${dataStats.foodCount} Mahlzeiten, ${dataStats.symptomCount} Symptome. Mindestens 1 Mahlzeit und 1 Symptom erforderlich.`);
      setIsLoading(false);
      return;
    }

    const prompt = `
      You are an AI assistant specialized in identifying potential food allergy triggers.
      The user has logged their meals and symptoms. Please analyze this data to find correlations between specific foods and the symptoms that occurred shortly after.

      Here is the food log:
      ${foodLog}

      Here is the symptom log:
      ${symptomLog}

      Based on your analysis, identify the most likely food triggers. 
      Please provide your answer in a valid JSON format with two keys: "possibleTriggers" (an array of food items as strings) and "explanation" (a brief summary of your reasoning in German).
      
      Focus on temporal correlations between food intake and symptom onset.
      
      Example: {"possibleTriggers": ["Milch", "Erdnüsse"], "explanation": "Die Symptome traten wiederholt nach dem Verzehr von Milchprodukten und Erdnüssen auf."}
    `;

    try {
      console.log("=== SENDE ANFRAGE AN KI ===");
      console.log("Prompt:", prompt);
      
      clearAiSuggestions();
      const result = await analyzeWithLlama(prompt);
      
      console.log("=== KI-ANTWORT ===");
      console.log("Result:", result);
      
      setAnalysisResult(result);
      saveAiSuggestions(result);
    } catch (e) {
      console.error("=== KI-ANALYSE FEHLER ===", e);
      setError('Ein Fehler ist bei der Analyse aufgetreten. Der Dienst ist möglicherweise nicht verfügbar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-primary flex items-center gap-2">
          <Wand2 /> KI-Analyse potenzieller Auslöser
        </CardTitle>
        <CardDescription>
          Lassen Sie die KI Muster zwischen Ihren Mahlzeiten und Symptomen erkennen.
          Diese Funktion dient nur zur Unterstützung und ersetzt keine ärztliche Beratung.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Datenstatistiken */}
        <div className="mb-4 p-3 bg-muted rounded-md">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>Verfügbare Daten: {dataStats.foodCount} Mahlzeiten, {dataStats.symptomCount} Symptome</span>
          </div>
        </div>

        <Button 
          onClick={handleAnalyze} 
          disabled={isLoading || dataStats.foodCount === 0 || dataStats.symptomCount === 0} 
          className="mb-4 bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isLoading ? 'Analysiere...' : 'Analyse starten'}
        </Button>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Fehler</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {analysisResult && !isLoading && (
          <div className="mt-4 space-y-4">
            <h3 className="font-headline text-lg text-primary">Analyseergebnis:</h3>
            {analysisResult.possibleTriggers && analysisResult.possibleTriggers.length > 0 ? (
              <div>
                <p className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="text-green-500" /> Mögliche Auslöser:
                </p>
                <ul className="list-disc pl-6 mt-2">
                  {analysisResult.possibleTriggers.map((trigger, index) => (
                    <li key={index} className="font-bold">{trigger}</li>
                  ))}
                </ul>
                {analysisResult.explanation && (
                    <p className="mt-4 text-sm text-muted-foreground">{analysisResult.explanation}</p>
                )}
              </div>
            ) : (
              <p>Es konnten keine eindeutigen Auslöser identifiziert werden.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
