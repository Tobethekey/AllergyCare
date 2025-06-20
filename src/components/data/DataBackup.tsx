'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import {
  getFoodEntries,
  getSymptomEntries,
  getUserProfiles,
  getAppSettings,
  saveToLocalStorage,
} from '@/lib/data-service';
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
} from '@/components/ui/alert-dialog';

// Import die Schlüssel aus data-service.ts
const FOOD_LOG_KEY = 'ALLERGYCARE_FOOD_LOGS';
const SYMPTOM_LOG_KEY = 'ALLERGYCARE_SYMPTOM_LOGS';
const APP_SETTINGS_KEY = 'ALLERGYCARE_APP_SETTINGS';
const USER_PROFILES_KEY = 'ALLERGYCARE_USER_PROFILES';

export function DataBackup() {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    try {
      const data = {
        foodEntries: getFoodEntries(),
        symptomEntries: getSymptomEntries(),
        userProfiles: getUserProfiles(),
        appSettings: getAppSettings(),
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `allergycare-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Backup erstellt',
        description: 'Ihre Daten wurden erfolgreich exportiert.',
      });
    } catch (error) {
      toast({
        title: 'Fehler beim Export',
        description: 'Die Daten konnten nicht exportiert werden.',
        variant: 'destructive',
      });
    }
  };

  const handleImportClick = () => {
    // Programmatically click the hidden file input
    fileInputRef.current?.click();
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Your detailed validation logic (unchanged)
      if (!data.foodEntries || !data.symptomEntries || !data.userProfiles) {
        throw new Error('Invalid backup file format');
      }
      const isValidFoodEntry = data.foodEntries.every((entry: any) => 
        entry.id && entry.timestamp && entry.foodItems && Array.isArray(entry.profileIds)
      );
      const isValidSymptomEntry = data.symptomEntries.every((entry: any) => 
        entry.id && entry.loggedAt && entry.symptom && entry.category && entry.severity && 
        entry.startTime && entry.duration && entry.profileId
      );
      const isValidUserProfile = data.userProfiles.every((profile: any) => 
        profile.id && profile.name
      );
      if (!isValidFoodEntry || !isValidSymptomEntry || !isValidUserProfile) {
        throw new Error('Ungültiges Datenformat in der Backup-Datei');
      }

      // Store data using the saveToLocalStorage function
      saveToLocalStorage(FOOD_LOG_KEY, data.foodEntries);
      saveToLocalStorage(SYMPTOM_LOG_KEY, data.symptomEntries);
      saveToLocalStorage(USER_PROFILES_KEY, data.userProfiles);
      if (data.appSettings) {
        saveToLocalStorage(APP_SETTINGS_KEY, data.appSettings);
      }

      toast({
        title: 'Import erfolgreich',
        description: 'Ihre Daten wurden erfolgreich importiert. Die Seite wird neu geladen.',
      });

      // Reload page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Fehler beim Import',
        description: error instanceof Error ? error.message : 'Die Backup-Datei konnte nicht gelesen werden.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      if(event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-primary">Datensicherung</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Daten exportieren</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Erstellen Sie eine Sicherungskopie aller Ihrer Daten als JSON-Datei.
            </p>
            <Button onClick={exportData} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Backup herunterladen
            </Button>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Daten importieren</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Stellen Sie Ihre Daten aus einer Backup-Datei wieder her.
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full" disabled={isImporting}>
                  <Upload className="mr-2 h-4 w-4" />
                  {isImporting ? 'Importiere...' : 'Backup wiederherstellen'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Daten importieren
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    <strong>Achtung:</strong> Beim Import werden alle aktuellen Daten überschrieben. 
                    Stellen Sie sicher, dass Sie vorher ein Backup erstellt haben.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  {/* This action button now triggers the file input click */}
                  <AlertDialogAction onClick={handleImportClick} disabled={isImporting}>
                    Fortfahren & Datei auswählen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {/* Hidden file input */}
            <Input
              ref={fileInputRef}
              id="backup-file"
              type="file"
              accept=".json"
              onChange={importData}
              disabled={isImporting}
              className="hidden"
            />
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-md">
          <h5 className="font-medium mb-2">Wichtige Hinweise:</h5>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Erstellen Sie regelmäßig Backups Ihrer Daten</li>
            <li>• Bewahren Sie Backup-Dateien sicher auf</li>
            <li>• Backup-Dateien enthalten alle persönlichen Gesundheitsdaten</li>
            <li>• Der Import überschreibt alle aktuellen Daten</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
