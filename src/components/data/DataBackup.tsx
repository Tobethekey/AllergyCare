'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, AlertTriangle, CheckCircle, File } from 'lucide-react';
import {
  getFoodEntries,
  getSymptomEntries,
  getUserProfiles,
  getAppSettings,
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

// Keys aus data-service.ts
const FOOD_LOG_KEY = 'ALLERGYCARE_FOOD_LOGS';
const SYMPTOM_LOG_KEY = 'ALLERGYCARE_SYMPTOM_LOGS';
const APP_SETTINGS_KEY = 'ALLERGYCARE_APP_SETTINGS';
const USER_PROFILES_KEY = 'ALLERGYCARE_USER_PROFILES';

// Interface für die Import-Daten
interface BackupData {
  foodEntries: any[];
  symptomEntries: any[];
  userProfiles: any[];
  appSettings?: any;
  exportDate: string;
  version: string;
}

export function DataBackup() {
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedBackupData, setParsedBackupData] = useState<BackupData | null>(null);
  const [backupStats, setBackupStats] = useState<{
    profiles: number;
    foodEntries: number;
    symptomEntries: number;
  } | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
      console.error('Export error:', error);
      toast({
        title: 'Fehler beim Export',
        description: 'Die Daten konnten nicht exportiert werden.',
        variant: 'destructive',
      });
    }
  };

  const selectBackupFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    
    try {
      const text = await file.text();
      const data = JSON.parse(text) as BackupData;

      // Basis-Validierung der Datenstruktur
      if (!data.foodEntries || !data.symptomEntries || !data.userProfiles) {
        throw new Error('Invalid backup file format');
      }

      // Backup-Daten parsen und Statistiken extrahieren
      setParsedBackupData(data);
      setBackupStats({
        profiles: data.userProfiles.length,
        foodEntries: data.foodEntries.length,
        symptomEntries: data.symptomEntries.length,
      });

      toast({
        title: 'Backup-Datei ausgewählt',
        description: `${file.name} erfolgreich geladen. Klicken Sie auf "Backup anwenden", um fortzufahren.`,
      });
      
    } catch (error) {
      console.error('Backup file parsing error:', error);
      setSelectedFile(null);
      setParsedBackupData(null);
      setBackupStats(null);
      toast({
        title: 'Fehler beim Lesen der Backup-Datei',
        description: 'Das Format der ausgewählten Datei ist ungültig.',
        variant: 'destructive',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const showApplyConfirmation = () => {
    if (parsedBackupData) {
      setShowConfirmDialog(true);
    } else {
      toast({
        title: 'Keine Backup-Datei ausgewählt',
        description: 'Bitte wählen Sie zuerst eine Backup-Datei aus.',
        variant: 'destructive',
      });
    }
  };

  const applyBackup = () => {
    if (!parsedBackupData) return;
    
    setIsImporting(true);
    setShowConfirmDialog(false);
    
    try {
      // Daten im localStorage speichern
      window.localStorage.setItem(FOOD_LOG_KEY, JSON.stringify(parsedBackupData.foodEntries));
      window.localStorage.setItem(SYMPTOM_LOG_KEY, JSON.stringify(parsedBackupData.symptomEntries));
      window.localStorage.setItem(USER_PROFILES_KEY, JSON.stringify(parsedBackupData.userProfiles));
      
      if (parsedBackupData.appSettings) {
        window.localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(parsedBackupData.appSettings));
      }
      
      // Aktivitätszeitstempel aktualisieren
      window.localStorage.setItem('ALLERGYCARE_LAST_ACTIVITY', new Date().toISOString());

      // Erfolgs-Dialog anzeigen
      setImportSuccess(true);

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Fehler beim Import',
        description: 'Die Daten konnten nicht importiert werden.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      // Form zurücksetzen
      setSelectedFile(null);
      setParsedBackupData(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const resetFileSelection = () => {
    setSelectedFile(null);
    setParsedBackupData(null);
    setBackupStats(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Seite neu laden, wenn der Erfolgs-Dialog geschlossen wird
  const handleSuccessDialogClose = () => {
    setImportSuccess(false);
    window.location.reload();
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

          <div className="space-y-3">
            <h4 className="font-semibold mb-2">Daten importieren</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Stellen Sie Ihre Daten aus einer Backup-Datei wieder her.
            </p>
            
            <div className="flex flex-col space-y-3">
              <Label htmlFor="backup-file" className="w-full">
                <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Backup wiederherstellen
                </Button>
                <Input
                  ref={fileInputRef}
                  id="backup-file"
                  type="file"
                  accept=".json"
                  onChange={selectBackupFile}
                  className="hidden"
                />
              </Label>
              
              {selectedFile && (
                <div className="rounded-md border p-3 bg-muted/30">
                  <div className="flex items-center">
                    <File className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm truncate">{selectedFile.name}</span>
                  </div>
                  {backupStats && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <p>Enthält: {backupStats.profiles} Profile, {backupStats.foodEntries} Nahrungseinträge, {backupStats.symptomEntries} Symptomeinträge</p>
                    </div>
                  )}
                </div>
              )}

              <Button 
                onClick={showApplyConfirmation} 
                disabled={!selectedFile || isImporting}
                variant="default"
                className="w-full"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Backup anwenden
              </Button>

              {selectedFile && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetFileSelection}
                >
                  Auswahl zurücksetzen
                </Button>
              )}
            </div>
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

      {/* Bestätigungs-Dialog für Backup-Anwendung */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Backup anwenden
            </AlertDialogTitle>
            <AlertDialogDescription>
              <strong>Achtung:</strong> Beim Anwenden des Backups werden alle aktuellen Daten überschrieben. 
              Dieser Vorgang kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {backupStats && (
            <div className="py-2">
              <p className="text-sm font-medium">Das ausgewählte Backup enthält:</p>
              <ul className="text-sm space-y-1 mt-1">
                <li>• {backupStats.profiles} Benutzerprofile</li>
                <li>• {backupStats.foodEntries} Nahrungsmitteleinträge</li>
                <li>• {backupStats.symptomEntries} Symptomeinträge</li>
              </ul>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={applyBackup}>
              Jetzt anwenden
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Erfolgs-Popup nach erfolgreichem Import */}
      <Dialog open={importSuccess} onOpenChange={setImportSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Backup erfolgreich angewendet
            </DialogTitle>
            <DialogDescription>
              Ihre Daten wurden erfolgreich wiederhergestellt.
            </DialogDescription>
          </DialogHeader>
          
          {backupStats && (
            <div className="py-4">
              <p className="mb-2">Folgende Daten wurden importiert:</p>
              <ul className="space-y-1 text-sm">
                <li>• {backupStats.profiles} Benutzerprofile</li>
                <li>• {backupStats.foodEntries} Nahrungsmitteleinträge</li>
                <li>• {backupStats.symptomEntries} Symptomeinträge</li>
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
