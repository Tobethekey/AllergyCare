
'use client';

import type React from 'react';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, FileDown, Calendar, Filter, AlertCircle, ClipboardPlus, Apple, LinkIcon } from 'lucide-react';
import { getFoodEntries, getSymptomEntries, exportDataToCsv, getFoodEntryById } from '@/lib/data-service';
import type { FoodEntry, SymptomEntry } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO, isValid } from 'date-fns';
import { de } from 'date-fns/locale';
import Image from 'next/image';

type ReportItem = (FoodEntry & { type: 'food' }) | (SymptomEntry & { type: 'symptom' });

export function ReportGenerator() {
  const [allFoodEntries, setAllFoodEntries] = useState<FoodEntry[]>([]);
  const [allSymptomEntries, setAllSymptomEntries] = useState<SymptomEntry[]>([]);
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  
  const [filteredItems, setFilteredItems] = useState<ReportItem[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const reportPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const food = getFoodEntries();
    const symptoms = getSymptomEntries();
    setAllFoodEntries(food);
    setAllSymptomEntries(symptoms);
    setLoadingInitialData(false);
  }, []);

  useEffect(() => {
    filterAndSortData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allFoodEntries, allSymptomEntries, startDate, endDate, searchTerm]);

  const filterAndSortData = () => {
    let items: ReportItem[] = [
      ...allFoodEntries.map(e => ({ ...e, type: 'food' as const })),
      ...allSymptomEntries.map(e => ({ ...e, type: 'symptom' as const }))
    ];

    if (startDate) {
      const start = parseISO(startDate).getTime();
      items = items.filter(item => {
        const itemDate = parseISO(item.type === 'food' ? item.timestamp : item.startTime).getTime();
        return itemDate >= start;
      });
    }

    if (endDate) {
      const end = parseISO(endDate).getTime() + (24 * 60 * 60 * 1000 -1); // Include full end day
      items = items.filter(item => {
        const itemDate = parseISO(item.type === 'food' ? item.timestamp : item.startTime).getTime();
        return itemDate <= end;
      });
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      items = items.filter(item => {
        if (item.type === 'food') {
          return item.foodItems.toLowerCase().includes(lowerSearchTerm);
        } else {
          let match = item.symptom.toLowerCase().includes(lowerSearchTerm) || 
                 item.category.toLowerCase().includes(lowerSearchTerm);
          if (item.linkedFoodEntryId) {
            const linkedFood = getFoodEntryById(item.linkedFoodEntryId);
            if (linkedFood && linkedFood.foodItems.toLowerCase().includes(lowerSearchTerm)) {
              match = true;
            }
          }
          return match;
        }
      });
    }
    
    items.sort((a, b) => {
      const dateA = new Date(a.type === 'food' ? a.timestamp : a.startTime).getTime();
      const dateB = new Date(b.type === 'food' ? b.timestamp : b.startTime).getTime();
      return dateA - dateB; // Sort ascending for reports
    });
    
    setFilteredItems(items);
  };
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-primary flex items-center gap-2">
            <Filter /> Filteroptionen
          </CardTitle>
          <CardDescription>Passen Sie den Zeitraum und Suchbegriffe für Ihren Bericht an.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingInitialData ? (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label htmlFor="startDate">Startdatum</Label><Skeleton className="h-10 w-full" /></div>
                <div><Label htmlFor="endDate">Enddatum</Label><Skeleton className="h-10 w-full" /></div>
              </div>
              <div><Label htmlFor="searchTerm">Suchbegriff (Nahrungsmittel/Symptom)</Label><Skeleton className="h-10 w-full" /></div>
            </>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Startdatum</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="endDate">Enddatum</Label>
                  <Input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="searchTerm">Suchbegriff (Nahrungsmittel/Symptom/verkn. Mahlzeit)</Label>
                <Input id="searchTerm" type="text" placeholder="z.B. Milch, Hautausschlag, verknüpfte Pizza" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-4 justify-end">
        <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90" disabled={loadingInitialData || filteredItems.length === 0}>
          <Printer className="mr-2 h-4 w-4" /> Als PDF Drucken
        </Button>    
        <Button onClick={() => exportDataToCsv()} variant="outline" className="text-primary border-primary hover:bg-primary/10" disabled={loadingInitialData || (allFoodEntries.length === 0 && allSymptomEntries.length === 0)}>
          <FileDown className="mr-2 h-4 w-4" /> Als CSV Exportieren
        </Button>      
      </div>

      <Card className="shadow-lg print-container" id="report-preview-area">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary text-center">Gesundheitsbericht AllergyCare</CardTitle>
          <CardDescription className="text-center">
            Zeitraum: {startDate && isValid(parseISO(startDate)) ? format(parseISO(startDate), "dd.MM.yyyy", { locale: de }) : 'Unbegrenzt'} - {endDate && isValid(parseISO(endDate)) ? format(parseISO(endDate), "dd.MM.yyyy", { locale: de }) : 'Unbegrenzt'}
            {searchTerm && <span className="block">Suchbegriff: {searchTerm}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent ref={reportPreviewRef} className="report-preview space-y-4">
          {loadingInitialData ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
                <AlertCircle className="mx-auto h-10 w-10 mb-2" />
                {allFoodEntries.length === 0 && allSymptomEntries.length === 0 
                  ? "Es sind noch keine Daten vorhanden. Bitte dokumentieren Sie zuerst Mahlzeiten oder Symptome."
                  : "Keine Daten für die ausgewählten Filter gefunden."
                }
            </div>
          ) : (
            filteredItems.map(item => {
              let linkedFoodDetails: FoodEntry | undefined;
              if (item.type === 'symptom' && item.linkedFoodEntryId) {
                linkedFoodDetails = getFoodEntryById(item.linkedFoodEntryId);
              }

              return (
                <div key={item.id} className="p-3 border rounded-md break-inside-avoid-page">
                  <h4 className="font-semibold text-primary flex items-center gap-2">
                    {item.type === 'food' ? <Apple size={18} /> : <ClipboardPlus size={18} />}
                    {item.type === 'food' ? 'Mahlzeit' : 'Symptom'} - {format(parseISO(item.type === 'food' ? item.timestamp : item.startTime), "dd.MM.yyyy HH:mm", { locale: de })} Uhr
                  </h4>
                  {item.type === 'food' ? (
                    <div className="text-sm mt-1">
                      <p><strong>Nahrungsmittel:</strong> {item.foodItems}</p>
                      {item.photo && (
                          <div className="mt-2 relative w-32 h-32 rounded overflow-hidden border border-input">
                              <Image src={item.photo} alt="Mahlzeit Foto" layout="fill" objectFit="cover" data-ai-hint="food meal" />
                          </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm mt-1 space-y-0.5">
                      <p><strong>Beschreibung:</strong> {item.symptom}</p>
                      <p><strong>Kategorie:</strong> {item.category}</p>
                      <p><strong>Schweregrad:</strong> {item.severity}</p>
                      <p><strong>Dauer:</strong> {item.duration}</p>
                      <p className="text-xs text-muted-foreground">Protokolliert am: {format(parseISO(item.loggedAt), "dd.MM.yyyy HH:mm", { locale: de })} Uhr</p>
                      {linkedFoodDetails && (
                        <div className="mt-1 pt-1 border-t border-dashed">
                           <p className="text-xs flex items-center gap-1">
                            <LinkIcon className="h-3 w-3 text-muted-foreground" />
                            <span className="font-semibold">Verkn. Mahlzeit:</span> 
                            <span className="text-muted-foreground">
                              {format(parseISO(linkedFoodDetails.timestamp), "dd.MM.yy HH:mm", { locale: de })} - {linkedFoodDetails.foodItems.substring(0,30)}{linkedFoodDetails.foodItems.length > 30 ? '...' : ''}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
      
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          /* Ensure cards don't break across pages if possible */
          .break-inside-avoid-page {
             break-inside: avoid-page;
          }
        }
        .report-preview h4 { font-family: 'Belleza', sans-serif; }
        .report-preview p, .report-preview div { font-family: 'Alegreya', serif; }
      `}</style>
    </div>
  );
}
