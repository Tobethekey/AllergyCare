diff --git a/src/components/data/DataBackup.tsx b/src/components/data/DataBackup.tsx
index eeb8d9014d60a79feb7d5946155a5b45885b7d8a..ba637fd0a03aa488d3e47d27bd1b231a885c7a28 100644
--- a/src/components/data/DataBackup.tsx
+++ b/src/components/data/DataBackup.tsx
@@ -1,33 +1,33 @@
 'use client';
 
 import { useState, useRef } from 'react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
-import { useToast } from '@/hooks/use-toast';
+import { useToast } from '@/components/ui/use-toast';
 import { Download, Upload, AlertTriangle } from 'lucide-react';
 import {
   getFoodEntries,
   getSymptomEntries,
   getUserProfiles,
   getAppSettings,
   // *** KORREKTUR: Wir importieren die spezifischen Speicherfunktionen ***
   saveAppSettings,
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
 
 // Die Schlüssel sind hier nicht mehr nötig, da wir die Logik in data-service kapseln
 const FOOD_LOG_KEY = 'ALLERGYCARE_FOOD_LOGS';
 const SYMPTOM_LOG_KEY = 'ALLERGYCARE_SYMPTOM_LOGS';
 const APP_SETTINGS_KEY = 'ALLERGYCARE_APP_SETTINGS';
