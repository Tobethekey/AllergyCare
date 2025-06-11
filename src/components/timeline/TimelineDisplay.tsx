
'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { getFoodEntries, getSymptomEntries, deleteFoodEntry, deleteSymptomEntry } from '@/lib/data-service';
import type { FoodEntry, SymptomEntry } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Apple, ClipboardPlus, Trash2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton"; // Added import

type TimelineItem = (FoodEntry & { type: 'food' }) | (SymptomEntry & { type: 'symptom' });

export function TimelineDisplay() {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = () => {
    const foodItems = getFoodEntries().map(entry => ({ ...entry, type: 'food' as const }));
    const symptomItems = getSymptomEntries().map(entry => ({ ...entry, type: 'symptom' as const }));
    
    const allItems = [...foodItems, ...symptomItems];
    allItems.sort((a, b) => {
      const dateA = new Date(a.type === 'food' ? a.timestamp : a.startTime).getTime();
      const dateB = new Date(b.type === 'food' ? b.timestamp : b.startTime).getTime();
      return dateB - dateA; // Sort descending (newest first)
    });
    setTimelineItems(allItems);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = (id: string, type: 'food' | 'symptom') => {
    if (type === 'food') {
      deleteFoodEntry(id);
    } else {
      deleteSymptomEntry(id);
    }
    fetchData(); // Refresh data
    toast({
      title: "Eintrag gelöscht",
      description: "Der Eintrag wurde erfolgreich entfernt.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-md"><CardHeader><CardTitle><Skeleton className="h-6 w-1/2" /></CardTitle><CardDescription><Skeleton className="h-4 w-3/4" /></CardDescription></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent></Card>
        <Card className="shadow-md"><CardHeader><CardTitle><Skeleton className="h-6 w-1/2" /></CardTitle><CardDescription><Skeleton className="h-4 w-3/4" /></CardDescription></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent></Card>
        <Card className="shadow-md"><CardHeader><CardTitle><Skeleton className="h-6 w-1/2" /></CardTitle><CardDescription><Skeleton className="h-4 w-3/4" /></CardDescription></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (timelineItems.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Noch keine Einträge vorhanden.</p>
          <p className="text-sm text-muted-foreground">Beginnen Sie mit der Dokumentation von Mahlzeiten oder Symptomen.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {timelineItems.map((item) => (
        <Card key={item.id} className="shadow-md transition-all duration-300 ease-in-out hover:shadow-lg">
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2 font-headline text-lg text-primary">
                {item.type === 'food' ? <Apple className="h-5 w-5" /> : <ClipboardPlus className="h-5 w-5" />}
                {item.type === 'food' ? 'Mahlzeit' : 'Symptom'}
              </CardTitle>
              <CardDescription className="text-xs">
                {item.type === 'food' 
                  ? `Dokumentiert: ${format(parseISO(item.timestamp), "dd.MM.yyyy HH:mm", { locale: de })} Uhr`
                  : `Beginn: ${format(parseISO(item.startTime), "dd.MM.yyyy HH:mm", { locale: de })} Uhr (Protokolliert: ${format(parseISO(item.loggedAt), "dd.MM.yyyy HH:mm", { locale: de })} Uhr)`}
              </CardDescription>
            </div>
             <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Eintrag löschen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Möchten Sie diesen Eintrag wirklich unwiderruflich löschen?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(item.id, item.type)} className="bg-destructive hover:bg-destructive/90">
                      Löschen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
          </CardHeader>
          <CardContent>
            {item.type === 'food' ? (
              <div className="space-y-2">
                <p><span className="font-semibold">Nahrungsmittel:</span> {item.foodItems}</p>
                {item.photo && (
                  <div className="mt-2 relative w-full max-w-xs h-48 rounded overflow-hidden border border-input">
                    <Image src={item.photo} alt="Mahlzeit Foto" layout="fill" objectFit="cover" data-ai-hint="food meal" />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <p><span className="font-semibold">Beschreibung:</span> {item.symptom}</p>
                <p><span className="font-semibold">Kategorie:</span> {item.category}</p>
                <p><span className="font-semibold">Schweregrad:</span> {item.severity}</p>
                <p><span className="font-semibold">Dauer:</span> {item.duration}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
