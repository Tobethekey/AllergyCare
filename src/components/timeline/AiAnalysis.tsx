'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getFormattedLogsForAI, saveAiSuggestions, getAiSuggestions, clearAiSuggestions } from '@/lib/data-service';
import { analyzeTriggersAction } from '@/lib/actions';
import type { AiSuggestion } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export function AiAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AiSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load previous analysis from local storage on mount
    const storedAnalysis = getAiSuggestions();
    if (storedAnalysis) {
      setAnalysisResult(storedAnalysis);
    }
  }, []);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null); // Clear previous results before new analysis
    clearAiSuggestions(); // Clear stored suggestions

    const { foodLog, symptomLog } = getFormattedLogsForAI();

    if (!foodLog && !symptomLog) {
        setError("Bitte dokumentieren Sie zuerst einige Mahlzeiten und Symptome, um eine Analyse durchführen zu können.");
        setIsLoading(false);
        return;
    }
    if (!foodLog) {
        setError("Keine Mahlzeiten dokumentiert. Bitte fügen Sie Mahlzeiten hinzu.");
        setIsLoading(false);
        return;
    }
    if (!symptomLog) {
        setError("Keine Symptome dokumentiert. Bitte fügen Sie Symptome hinzu.");
        setIsLoading(false);
        return;
    }


    try {
      const result = await analyzeTriggersAction({ foodLog, symptomLog });
      setAnalysisResult(result);
      saveAiSuggestions(result); // Save new analysis to local storage
    } catch (e) {
      setError('Ein Fehler ist bei der Analyse aufgetreten.');
      console.error(e);
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
        <Button onClick={handleAnalyze} disabled={isLoading} className="mb-4 bg-accent hover:bg-accent/90 text-accent-foreground">
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
                <p className="font-semibold flex items-center gap-2"><CheckCircle2 className="text-green-500" /> Mögliche Auslöser:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {analysisResult.possibleTriggers.map((trigger, index) => (
                    <li key={index}>{trigger}</li>
                  ))}
                </ul>
              </div>
            ) : (
               <p className="flex items-center gap-2"><CheckCircle2 className="text-green-500" /> Keine spezifischen Auslöser gefunden basierend auf den aktuellen Daten.</p>
            )}
            {analysisResult.reasoning && (
              <div>
                <p className="font-semibold">Begründung:</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysisResult.reasoning}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
