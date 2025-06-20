'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { importJSON, exportData } from '@/lib/local-storage'; // Angenommen, die Funktionen sind so benannt
import { Upload, Download, File, CheckCircle } from 'lucide-react';

// Annahme: Es gibt eine importJSON Funktion in local-storage
// Falls sie anders heißt, bitte anpassen.

export function DataBackup() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = () => {
    const jsonData = exportData();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `allergycare-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: "Export erfolgreich",
      description: "Ihre Daten wurden als JSON-Datei heruntergeladen.",
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleApplyBackup = () => {
    if (!selectedFile) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        const success = importJSON(content); // Ihre Import-Funktion
        if (success) {
          toast({
            title: "Import erfolgreich",
            description: "Daten wiederhergestellt. Die Seite wird neu geladen.",
          });
          // WICHTIG: Seite neu laden, um die importierten Daten zu übernehmen
          setTimeout(() => window.location.reload(), 1500);
        } else {
          toast({
            variant: "destructive",
            title: "Import fehlgeschlagen",
            description: "Die Datei hat ein ungültiges Format.",
          });
          setIsImporting(false);
        }
      }
    };
    reader.readAsText(selectedFile);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-primary">Datensicherung</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold mb-2">Daten exportieren</h4>
          <Button onClick={handleExport} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Backup herunterladen
          </Button>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold mb-2">Daten importieren</h4>
          <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Backup-Datei auswählen
          </Button>
          <Input
            ref={fileInputRef}
            id="backup-file"
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
          {selectedFile && (
            <div className="rounded-md border p-3 bg-muted/30 text-sm flex items-center">
              <File className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{selectedFile.name}</span>
            </div>
          )}
          <Button 
            onClick={handleApplyBackup} 
            disabled={!selectedFile || isImporting}
            className="w-full"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {isImporting ? 'Importiere...' : 'Backup anwenden'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
