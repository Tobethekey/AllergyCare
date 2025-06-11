
'use client';

import type React from 'react';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, FileDown, Filter, AlertCircle, Apple, ClipboardPlus, LinkIcon } from 'lucide-react';
import { getFoodEntries, getSymptomEntries, exportDataToCsv, getFoodEntryById } from '@/lib/data-service';
import type { FoodEntry, SymptomEntry } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO, isValid } from 'date-fns';
import { de } from 'date-fns/locale';
import Image from 'next/image';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  
  const handleDirectPdfDownload = async () => {
    if (loadingInitialData || filteredItems.length === 0 || !reportPreviewRef.current) {
      console.warn('PDF generation conditions not met.');
      return;
    }

    const reportElement = reportPreviewRef.current;
    
    // Store original styles to restore them later
    const originalStyles = {
        width: reportElement.style.width,
        height: reportElement.style.height,
        padding: reportElement.style.padding,
        overflow: reportElement.style.overflow,
        position: reportElement.style.position,
        left: reportElement.style.left,
        top: reportElement.style.top,
    };
    
    // Prepare element for canvas rendering to mimic print styles
    // This helps html2canvas capture a layout more suitable for PDF
    reportElement.style.width = '210mm'; // A4 width
    reportElement.style.height = 'auto'; // Auto height based on content
    reportElement.style.padding = '15mm'; // Simulate print margins
    reportElement.style.overflow = 'visible'; // Ensure all content is captured
    // Temporarily move off-screen to avoid layout shifts if styles affect visible page
    reportElement.style.position = 'absolute';
    reportElement.style.left = '-9999px';
    reportElement.style.top = '-9999px';

    const canvas = await html2canvas(reportElement, {
      scale: 2, // Higher scale for better resolution
      useCORS: true,
      logging: false, // Set to true for debugging html2canvas
      onclone: (documentClone) => {
        // Apply specific styles to the cloned document for rendering
        // This is where styles normally handled by @media print can be enforced
        const clonedReportElement = documentClone.getElementById('report-preview-area');
        if (clonedReportElement) {
            clonedReportElement.style.background = 'white';
            clonedReportElement.style.color = 'black';
            clonedReportElement.style.fontFamily = 'Arial, sans-serif';

            // Ensure all children also get basic print-friendly styles
            const allElements = clonedReportElement.querySelectorAll<HTMLElement>('*');
            allElements.forEach(el => {
                el.style.color = 'black';
                el.style.fontFamily = 'Arial, sans-serif';
                // Reset any theme-specific colors explicitly
                if (el.classList.contains('text-primary')) el.style.color = 'black';
                if (el.classList.contains('text-muted-foreground')) el.style.color = 'black';
                if (el.classList.contains('font-headline')) el.style.fontFamily = 'Arial, sans-serif';
            });
            
            clonedReportElement.querySelectorAll<HTMLElement>('img').forEach(img => {
                img.style.maxWidth = '100px';
                img.style.maxHeight = '100px';
                img.style.border = '1px solid #ccc';
            });
            // Make sure report items are not broken across pages if possible (jsPDF handles paging)
            clonedReportElement.querySelectorAll<HTMLElement>('.report-item').forEach(item => {
                item.style.breakInside = 'avoid'; 
            });
        }
      }
    });
    
    // Restore original styles to the actual element
    reportElement.style.width = originalStyles.width;
    reportElement.style.height = originalStyles.height;
    reportElement.style.padding = originalStyles.padding;
    reportElement.style.overflow = originalStyles.overflow;
    reportElement.style.position = originalStyles.position;
    reportElement.style.left = originalStyles.left;
    reportElement.style.top = originalStyles.top;

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate image dimensions to fit A4 page width, maintaining aspect ratio
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pdfWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    let currentPosition = 0;
    let remainingImgHeight = imgHeight;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, currentPosition, imgWidth, imgHeight);
    remainingImgHeight -= pdfHeight;

    // Add more pages if content overflows
    while (remainingImgHeight > 0) {
      currentPosition -= pdfHeight; // Move the image viewport up for the next page
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, currentPosition, imgWidth, imgHeight);
      remainingImgHeight -= pdfHeight;
    }

    pdf.save('AllergyCare-Bericht.pdf');
  };


  return (
    <div className="space-y-6">
      <Card className="shadow-lg no-print">
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

      <div className="flex flex-wrap gap-4 justify-end no-print">
        <Button onClick={handleDirectPdfDownload} className="bg-primary hover:bg-primary/90" disabled={loadingInitialData || filteredItems.length === 0}>
          <Printer className="mr-2 h-4 w-4" /> Download als PDF
        </Button>    
        <Button onClick={() => exportDataToCsv()} className="bg-primary hover:bg-primary/90" disabled={loadingInitialData || (allFoodEntries.length === 0 && allSymptomEntries.length === 0)}>
          <FileDown className="mr-2 h-4 w-4" /> Download als CSV
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
                <div key={item.id} className="p-3 border rounded-md break-inside-avoid-page report-item">
                  <h4 className="font-semibold text-primary flex items-center gap-2">
                    {item.type === 'food' ? <Apple size={18} /> : <ClipboardPlus size={18} />}
                    {item.type === 'food' ? 'Mahlzeit' : 'Symptom'} - {format(parseISO(item.type === 'food' ? item.timestamp : item.startTime), "dd.MM.yyyy HH:mm", { locale: de })} Uhr
                  </h4>
                  {item.type === 'food' ? (
                    <div className="text-sm mt-1">
                      <p><strong>Nahrungsmittel:</strong> {item.foodItems}</p>
                      {item.photo && (
                          <div className="mt-2 relative w-32 h-32 rounded overflow-hidden border border-input">
                              <Image src={item.photo} alt="Mahlzeit Foto" layout="fill" objectFit="cover" data-ai-hint="food meal"/>
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
            visibility: hidden !important;
          }
          html, body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          #report-preview-area, 
          #report-preview-area * {
            visibility: visible !important;
          }

          #report-preview-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            min-height: 100% !important;
            margin: 0 !important;
            padding: 15mm !important; /* Page margins for printing */
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
            font-size: 10pt !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          #report-preview-area .report-item {
            border: 1px solid #ccc !important; /* Ensure borders are visible */
            page-break-inside: avoid; /* Use this instead of break-inside-avoid-page for broader compatibility */
          }
          
          #report-preview-area .text-primary,
          #report-preview-area .text-muted-foreground,
          #report-preview-area .font-headline,
          #report-preview-area .CardTitle, /* Target CardTitle specifically if needed */
          #report-preview-area .CardDescription { /* Target CardDescription specifically */
             color: black !important;
             font-family: Arial, sans-serif !important; /* Use print-friendly fonts */
          }
          /* Ensure specific components reset their themed colors */
          #report-preview-area .CardHeader, #report-preview-area .CardContent {
            background: white !important;
          }
          
          #report-preview-area h4 { /* Style headings for print */
            font-family: Arial, sans-serif !important;
            font-size: 12pt !important;
            font-weight: bold !important;
            color: black !important;
          }
           #report-preview-area p, #report-preview-area div, #report-preview-area strong {
             font-family: Arial, sans-serif !important;
             color: black !important;
           }


          #report-preview-area img {
            max-width: 100px !important; /* Control image size more strictly for print */
            max-height: 100px !important;
            height: auto !important;
            width: auto !important;
            object-fit: contain !important;
            display: block !important;
            margin-top: 8px !important;
            margin-bottom: 8px !important;
            border: 1px solid #eee !important; /* Optional: border around images */
          }
          
          .no-print {
            display: none !important;
          }

          @page {
            size: A4 portrait; 
            margin: 0; 
          }
        }
        /* Non-print specific styles remain */
        .report-preview h4 { font-family: 'Belleza', sans-serif; } /* For screen */
        .report-preview p, .report-preview div { font-family: 'Alegreya', serif; } /* For screen */
      `}</style>
    </div>
  );
}
