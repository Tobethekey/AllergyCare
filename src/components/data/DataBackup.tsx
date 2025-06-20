'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, AlertTriangle, CheckCircle } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { FoodEntry, SymptomEntry, UserProfile } from '@/lib/types';

// Importiere die Schlüssel aus data-service.ts oder exportiere sie dort
const FOOD_LOG_KEY = 'ALLERGYCARE_FOOD_LOGS';
const SYMPTOM_LOG_KEY = 'ALLERGYCARE_SYMPTOM_LOGS';
const APP_SETTINGS_KEY = 'ALLERGYCARE_APP_SETTINGS';
const USER_PROFILES_KEY = 'ALLERGYCARE_USER_PROFILES';
const LAST_ACTIVITY_KEY = 'ALLERGYCARE_LAST_ACTIVITY';

// Aktuelle Version der App-Datenstruktur
const CURRENT_APP_VERSION = '1.0';

// Interface für Import-Daten
interface BackupData {
  foodEntries: FoodEntry[];
  symptomEntries: SymptomEntry[];
  userProfiles: UserProfile[];
  appSettings?: {
    name?: string;
    notes?: string;
  };
  exportDate: string;
  version: string;
}

export function DataBackup() {
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importStats, setImportStats] = useState<{
    profiles: number;
    foodEntries: number;
    symptomEntries: number;
    version: string;
    exportDate: string;
  } | null>(null);
  const { toast } = useToast();

  const exportData = () => {
    try {
      const data: BackupData = {
        foodEntries: getFoodEntries(),
        symptomEntries: getSymptomEntries(),
        userProfiles: getUserProfiles(),
        appSettings: getAppSettings(),
        exportDate: new Date().toISOString(),
        version: CURRENT_APP_VERSION
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
      console.error('Export error:', error);
      toast({
        title: 'Fehler beim Export',
        description: 'Die Daten konnten nicht exportiert werden.',
        variant: 'destructive',
      });
    }
  };

  // Validiert ein einzelnes Datenfeld mit einer bestimmten Struktur
  const validateDataStructure = (data: BackupData): boolean => {
    // Überprüfe, ob alle erforderlichen Hauptfelder existieren
    if (!data.foodEntries || !data.symptomEntries || !data.userProfiles) {
      console.error('Invalid structure: Missing required fields');
      return false;
    }

    // Überprüfe die Version (optional könnte hier später eine Migrationslogik implementiert werden)
    if (data.version !== CURRENT_APP_VERSION) {
      console.warn(`Version mismatch: Backup version ${data.version}, current app version ${CURRENT_APP_VERSION}`);
      // Entscheidung: Trotzdem weiter importieren, aber mit Warnung
    }

    try {
      // Überprüfe die Struktur von foodEntries
      const validFoodEntries = data.foodEntries.every(entry => 
        typeof entry.id === 'string' &&
        typeof entry.timestamp === 'string' &&
        typeof entry.foodItems === 'string' &&
        Array.isArray(entry.profileIds)
      );
      if (!validFoodEntries) {
        console.error('Invalid food entries structure');
        return false;
      }

      // Überprüfe die Struktur von symptomEntries
      const validSymptomEntries = data.symptomEntries.every(entry => 
        typeof entry.id === 'string' &&
        typeof entry.loggedAt === 'string' &&
        typeof entry.symptom === 'string' &&
        typeof entry.category === 'string' &&
        typeof entry.severity === 'string' &&
        typeof entry.startTime === 'string' &&
        typeof entry.duration === 'string' &&
        typeof entry.profileId === 'string'
      );
      if (!validSymptomEntries) {
        console.error('Invalid symptom entries structure');
        return false;
      }

      // Überprüfe die Struktur von userProfiles
      const validUserProfiles = data.userProfiles.every(profile => 
        typeof profile.id === 'string' &&
        typeof profile.name === 'string'
      );
      if (!validUserProfiles) {
        console.error('Invalid user profiles structure');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating data structure:', error);
      return false;
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setShowImportDialog(false); // Schließe den Import-Dialog
    
    try {
      const text = await file.text();
      const data = JSON.parse(text) as BackupData;

      // Validiere die gesamte Datenstruktur
      if (!validateDataStructure(data)) {
        throw new Error('Ungültiges Backup-Dateiformat');
      }

      console.log('Importierte Daten:', {
        foodEntries: data.foodEntries.length,
        symptomEntries: data.symptomEntries.length,
        userProfiles: data.userProfiles.length,
        version: data.version,
        exportDate: data.exportDate
      });

      // Speichere die Daten im localStorage
      window.localStorage.setItem(FOOD_LOG_KEY, JSON.stringify(data.foodEntries));
      window.localStorage.setItem(SYMPTOM_LOG_KEY, JSON.stringify(data.symptomEntries));
      window.localStorage.setItem(USER_PROFILES_KEY, JSON.stringify(data.userProfiles));
      
      if (data.appSettings) {
        window.localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(data.appSettings));
      }
      
      // Aktualisiere den Aktivitätszeitstempel
      window.localStorage.setItem(LAST_ACTIVITY_KEY, new Date().toISOString());

      // Setze die Statistiken für den Erfolgs-Dialog
      setImportStats({
        profiles: data.userProfiles.length,
        foodEntries: data.foodEntries.length,
        symptomEntries: data.symptomEntries.length,
        version: data.version,
        exportDate: new Date(data.exportDate).toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      });
      
      // Zeige den Erfolgs-Dialog an
      setImportSuccess(true);

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Fehler beim Import',
        description: error instanceof Error ? 
          `Die Backup-Datei konnte nicht gelesen werden: ${error.message}` : 
          'Die Backup-Datei konnte nicht gelesen werden. Überprüfen Sie das Dateiformat.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      // Zurücksetzen des Datei-Inputs
      event.target.value = '';
    }
  };

  // Seite neu laden, wenn der Erfolgs-Dialog geschlossen wird
  const handleSuccessDialogClose = () => {
    setImportSuccess(false);
    window.location.reload();
  };

  // Dialog-State synchron halten
  useEffect(() => {
    if (!importSuccess) {
      // Wenn der Dialog geschlossen wird (aus irgendeinem Grund), Seite neu laden
      if (importStats !== null) {
        window.location.reload();
      }
    }
  }, [importSuccess, importStats]);

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
            
            <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Backup wiederherstellen
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
                  <AlertDialogAction asChild>
                    <Label htmlFor="backup-file" className="cursor-pointer">
                      <Input
                        id="backup-file"
                        type="file"
                        accept=".json"
                        onChange={importData}
                        disabled={isImporting}
                        className="hidden"
                      />
                      {isImporting ? 'Importiere...' : 'Datei auswählen'}
                    </Label>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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

      {/* Erfolgs-Dialog nach erfolgreichem Import */}
      <Dialog open={importSuccess} onOpenChange={(open) => {
        setImportSuccess(open);
        if (!open) window.location.reload();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Backup erfolgreich importiert
            </DialogTitle>
            <DialogDescription>
              Ihre Daten wurden erfolgreich wiederhergestellt.
            </DialogDescription>
          </DialogHeader>
          
          {importStats && (
            <div className="py-4">
              <p className="mb-2">Folgende Daten wurden importiert:</p>
              <ul className="space-y-1 text-sm">
                <li>• {importStats.profiles} Benutzerprofile</li>
                <li>• {importStats.foodEntries} Nahrungsmitteleinträge</li>
                <li>• {importStats.symptomEntries} Symptomeinträge</li>
                {importStats.version && (
                  <li>• Backup-Version: {importStats.version}</li>
                )}
                {importStats.exportDate && (
                  <li>• Erstellungsdatum: {importStats.exportDate}</li>
                )}
              </ul>
            </div>
          )}

          <DialogFooter>
            <Button onClick={handleSuccessDialogClose} className="w-full">
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
