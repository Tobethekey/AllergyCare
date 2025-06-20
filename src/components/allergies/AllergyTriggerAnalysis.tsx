'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getFoodEntries, getSymptomEntries, getFormattedLogsForAI } from '@/lib/data-service';
import { analyzeAllergyData } from '@/services/llamaApi';
import { 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  BarChart3, 
  Filter, 
  Download,
  Zap,
  Target,
  Info,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { format, parseISO, subDays, isAfter, isBefore } from 'date-fns';
import { de } from 'date-fns/locale';
import type { FoodEntry, SymptomEntry } from '@/lib/types';

interface TriggerData {
  food: string;
  confidence: number;
  occurrences: number;
  lastOccurrence: Date;
  symptoms: string[];
  timePattern: {
    averageOnsetTime: number; // in Minuten
    consistencyScore: number; // 0-1
  };
  severity: {
    average: number;
    range: [number, number];
  };
}

interface AnalysisFilters {
  dateRange: {
    start: string;
    end: string;
  };
  minSeverity: number;
  symptoms: string[];
  foods: string[];
}

interface AllergyTriggerAnalysisProps {
  onTriggerSelect?: (trigger: string) => void;
}

export function AllergyTriggerAnalysis({ onTriggerSelect }: AllergyTriggerAnalysisProps) {
  const [triggers, setTriggers] = useState<TriggerData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalysisFilters>({
    dateRange: {
      start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd')
    },
    minSeverity: 1,
    symptoms: [],
    foods: []
  });
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    possibleTriggers: string[];
    explanation: string;
  } | null>(null);

  // Lade verfügbare Optionen für Filter
  const filterOptions = useMemo(() => {
    const foods = getFoodEntries();
    const symptoms = getSymptomEntries();
    
    const uniqueFoods = [...new Set(foods.flatMap(entry => 
      entry.foods?.map(f => f.name) || []
    ))].sort();
    
    const uniqueSymptoms = [...new Set(symptoms.map(entry => entry.description))].sort();
    const uniqueCategories = [...new Set(symptoms.map(entry => entry.category))].sort();

    return {
      foods: uniqueFoods,
      symptoms: uniqueSymptoms,
      categories: uniqueCategories
    };
  }, []);

  // Analysiere Trigger basierend auf Daten und Filtern
  const analyzeTriggersFromData = (foods: FoodEntry[], symptoms: SymptomEntry[]): TriggerData[] => {
    const triggerMap = new Map<string, {
      occurrences: number;
      symptoms: string[];
      onsetTimes: number[];
      severities: number[];
      lastOccurrence: Date;
    }>();

    // Iteriere durch alle Symptom-Einträge
    symptoms.forEach(symptom => {
      const symptomTime = parseISO(symptom.startDate);
      
      // Finde Mahlzeiten in den letzten 24 Stunden vor dem Symptom
      const relevantFoods = foods.filter(food => {
        const foodTime = parseISO(food.timestamp);
        const timeDiff = symptomTime.getTime() - foodTime.getTime();
        return timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000; // 24 Stunden
      });

      // Für jede relevante Mahlzeit, analysiere die Lebensmittel
      relevantFoods.forEach(foodEntry => {
        const foodTime = parseISO(foodEntry.timestamp);
        const onsetTime = (symptomTime.getTime() - foodTime.getTime()) / (60 * 1000); // in Minuten

        foodEntry.foods?.forEach(food => {
          const key = food.name.toLowerCase();
          const existing = triggerMap.get(key);
          
          if (existing) {
            existing.occurrences++;
            existing.symptoms.push(symptom.description);
            existing.onsetTimes.push(onsetTime);
            existing.severities.push(symptom.severity);
            if (symptomTime > existing.lastOccurrence) {
              existing.lastOccurrence = symptomTime;
            }
          } else {
            triggerMap.set(key, {
              occurrences: 1,
              symptoms: [symptom.description],
              onsetTimes: [onsetTime],
              severities: [symptom.severity],
              lastOccurrence: symptomTime
            });
          }
        });
      });
    });

    // Konvertiere zu TriggerData Array und berechne Statistiken
    return Array.from(triggerMap.entries()).map(([food, data]) => {
      const avgOnsetTime = data.onsetTimes.reduce((a, b) => a + b, 0) / data.onsetTimes.length;
      const avgSeverity = data.severities.reduce((a, b) => a + b, 0) / data.severities.length;
      const severityRange: [number, number] = [
        Math.min(...data.severities),
        Math.max(...data.severities)
      ];
      
      // Einfache Confidence-Berechnung basierend auf Häufigkeit und Konsistenz
      const frequency = data.occurrences / symptoms.length;
      const timeConsistency = 1 - (Math.max(...data.onsetTimes) - Math.min(...data.onsetTimes)) / (24 * 60);
      const confidence = Math.min(100, (frequency * 0.6 + timeConsistency * 0.4) * 100);

      return {
        food,
        confidence: Math.round(confidence),
        occurrences: data.occurrences,
        lastOccurrence: data.lastOccurrence,
        symptoms: [...new Set(data.symptoms)],
        timePattern: {
          averageOnsetTime: Math.round(avgOnsetTime),
          consistencyScore: Math.round(timeConsistency * 100) / 100
        },
        severity: {
          average: Math.round(avgSeverity * 10) / 10,
          range: severityRange
        }
      };
    }).sort((a, b) => b.confidence - a.confidence);
  };

  // Lade und analysiere Daten
  const loadTriggerData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allFoods = getFoodEntries();
      const allSymptoms = getSymptomEntries();

      // Filtere Daten basierend auf den Filtern
      const startDate = parseISO(filters.dateRange.start);
      const endDate = parseISO(filters.dateRange.end);

      const filteredFoods = allFoods.filter(food => {
        const foodDate = parseISO(food.timestamp);
        return isAfter(foodDate, startDate) && isBefore(foodDate, endDate);
      });

      const filteredSymptoms = allSymptoms.filter(symptom => {
        const symptomDate = parseISO(symptom.startDate);
        const meetsDateRange = isAfter(symptomDate, startDate) && isBefore(symptomDate, endDate);
        const meetsSeverity = symptom.severity >= filters.minSeverity;
        
        return meetsDateRange && meetsSeverity;
      });

      // Analysiere Trigger
      const triggerData = analyzeTriggersFromData(filteredFoods, filteredSymptoms);
      setTriggers(triggerData);

      // Führe auch KI-Analyse durch für zusätzliche Insights
      if (filteredFoods.length > 0 && filteredSymptoms.length > 0) {
        try {
          const foods = filteredFoods.flatMap(entry => 
            entry.foods?.map(f => f.name) || []
          );
          const symptoms = filteredSymptoms.map(s => s.description);
          
          const aiResult = await analyzeAllergyData(foods, symptoms);
          setAiAnalysisResult(aiResult);
        } catch (aiError) {
          console.warn('KI-Analyse fehlgeschlagen:', aiError);
        }
      }

    } catch (err) {
      setError('Fehler beim Laden der Trigger-Daten');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTriggerData();
  }, [filters]);

  const handleExportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      filters,
      triggers,
      aiAnalysis: aiAnalysisResult,
      summary: {
        totalTriggers: triggers.length,
        highConfidenceTriggers: triggers.filter(t => t.confidence >= 70).length,
        averageConfidence: triggers.reduce((sum, t) => sum + t.confidence, 0) / triggers.length || 0
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `allergie-trigger-analyse-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-red-600 bg-red-50';
    if (confidence >= 60) return 'text-orange-600 bg-orange-50';
    if (confidence >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const formatOnsetTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} Min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-primary flex items-center gap-2">
            <Target className="h-6 w-6" />
            Allergie-Auslöser Analyse
          </CardTitle>
          <CardDescription>
            Identifizierung potenzieller Nahrungsmittel-Auslöser basierend auf zeitlichen Korrelationen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Übersicht</TabsTrigger>
              <TabsTrigger value="triggers">Auslöser</TabsTrigger>
              <TabsTrigger value="analysis">Analyse</TabsTrigger>
              <TabsTrigger value="filters">Filter</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Gefundene Auslöser</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{triggers.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {triggers.filter(t => t.confidence >= 70).length} mit hoher Wahrscheinlichkeit
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Durchschnittliche Onset-Zeit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {triggers.length > 0 
                        ? formatOnsetTime(Math.round(
                            triggers.reduce((sum, t) => sum + t.timePattern.averageOnsetTime, 0) / triggers.length
                          ))
                        : '–'
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">Nach Nahrungsaufnahme</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Häufigster Auslöser</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {triggers.length > 0 ? triggers[0].food : '–'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {triggers.length > 0 ? `${triggers[0].confidence}% Wahrscheinlichkeit` : 'Keine Daten'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {aiAnalysisResult && (
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertTitle>KI-Analyse Ergebnis</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2">
                      {aiAnalysisResult.possibleTriggers.length > 0 ? (
                        <div>
                          <p className="font-medium">Zusätzlich identifizierte Auslöser:</p>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            {aiAnalysisResult.possibleTriggers.map(trigger => (
                              <Badge key={trigger} variant="secondary">{trigger}</Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p>Die KI-Analyse hat keine zusätzlichen Auslöser identifiziert.</p>
                      )}
                      <p className="text-sm mt-2">{aiAnalysisResult.explanation}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="triggers" className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Analysiere Auslöser...</p>
                  </div>
                </div>
              ) : triggers.length === 0 ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Keine Auslöser gefunden</AlertTitle>
                  <AlertDescription>
                    Für den ausgewählten Zeitraum konnten keine signifikanten Auslöser identifiziert werden.
                    Versuchen Sie, den Zeitraum zu erweitern oder die Filter anzupassen.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {triggers.map((trigger, index) => (
                    <Card 
                      key={trigger.food} 
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        trigger.confidence >= 70 ? 'border-red-200 bg-red-50/30' : ''
                      }`}
                      onClick={() => onTriggerSelect?.(trigger.food)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-lg">{trigger.food}</span>
                                <Badge className={getConfidenceColor(trigger.confidence)}>
                                  {trigger.confidence}%
                                </Badge>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                            
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <BarChart3 className="h-3 w-3" />
                                  {trigger.occurrences}x aufgetreten
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Ø {formatOnsetTime(trigger.timePattern.averageOnsetTime)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  Schwere: {trigger.severity.average}/10
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Symptome:</span>
                                <div className="flex gap-1 flex-wrap">
                                  {trigger.symptoms.slice(0, 3).map(symptom => (
                                    <Badge key={symptom} variant="outline" className="text-xs">
                                      {symptom}
                                    </Badge>
                                  ))}
                                  {trigger.symptoms.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{trigger.symptoms.length - 3} weitere
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">Zuletzt</div>
                            <div className="text-sm">
                              {format(trigger.lastOccurrence, 'dd.MM.yyyy', { locale: de })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Wahrscheinlichkeit</span>
                            <span>{trigger.confidence}%</span>
                          </div>
                          <Progress value={trigger.confidence} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="methodology">
                  <AccordionTrigger>Analyse-Methodik</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Wie werden Auslöser identifiziert?</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Zeitliche Korrelation: Symptome werden mit Mahlzeiten der letzten 24h korreliert</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Häufigkeitsanalyse: Wie oft tritt dasselbe Lebensmittel vor Symptomen auf</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Konsistenz: Gleichmäßigkeit der Onset-Zeiten erhöht die Wahrscheinlichkeit</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>KI-Verstärkung: Zusätzliche medizinische Plausibilitätsprüfung</span>
                        </li>
                      </ul>
                    </div>
                    
                    <Alert className="border-amber-200 bg-amber-50">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertTitle className="text-amber-800">Wichtiger Hinweis</AlertTitle>
                      <AlertDescription className="text-amber-700">
                        Diese Analyse dient nur zur Unterstützung und ersetzt keine ärztliche Diagnose. 
                        Konsultieren Sie bei Verdacht auf Allergien immer einen Arzt oder Allergologen.
                      </AlertDescription>
                    </Alert>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="interpretation">
                  <AccordionTrigger>Ergebnis-Interpretation</AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-red-600 mb-1">Hohe Wahrscheinlichkeit (≥80%)</h5>
                        <p className="text-sm text-muted-foreground">
                          Starke Korrelation gefunden. Sollte ärztlich abgeklärt werden.
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-orange-600 mb-1">Mittlere Wahrscheinlichkeit (60-79%)</h5>
                        <p className="text-sm text-muted-foreground">
                          Möglicher Zusammenhang. Weitere Beobachtung empfohlen.
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-yellow-600 mb-1">Niedrige Wahrscheinlichkeit (40-59%)</h5>
                        <p className="text-sm text-muted-foreground">
                          Schwache Korrelation. Kann Zufall sein.
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-gray-600 mb-1">Sehr niedrig (<40%)</h5>
                        <p className="text-sm text-muted-foreground">
                          Wahrscheinlich kein Zusammenhang.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            <TabsContent value="filters" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Analyse-Filter
                  </CardTitle>
                  <CardDescription>
                    Passen Sie die Parameter für die Trigger-Analyse an
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Von</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={filters.dateRange.start}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, start: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">Bis</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={filters.dateRange.end}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, end: e.target.value }
                        }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min-severity">
                      Mindest-Schweregrad: {filters.minSeverity}
                    </Label>
                    <div className="px-3">
                      <input
                        id="min-severity"
                        type="range"
                        min="1"
                        max="10"
                        value={filters.minSeverity}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          minSeverity: parseInt(e.target.value)
                        }))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={loadTriggerData} disabled={isLoading}>
                      {isLoading ? 'Analysiere...' : 'Analyse aktualisieren'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleExportReport}
                      disabled={triggers.length === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Bericht exportieren
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
