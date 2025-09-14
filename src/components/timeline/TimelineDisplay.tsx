diff --git a/src/components/timeline/TimelineDisplay.tsx b/src/components/timeline/TimelineDisplay.tsx
index f6890665367e79108f2e4feceaf63260cdf3df1b..3c246d54a6a7cb0ca01b8f78e577f99d18e8eb10 100644
--- a/src/components/timeline/TimelineDisplay.tsx
+++ b/src/components/timeline/TimelineDisplay.tsx
@@ -1,39 +1,39 @@
 
 'use client';
 
 import type React from 'react';
 import { useEffect, useState } from 'react';
 import { getFoodEntries, getSymptomEntries, deleteFoodEntry, deleteSymptomEntry, getFoodEntryById, getUserProfiles, getUserProfileById } from '@/lib/data-service';
 import type { FoodEntry, SymptomEntry, UserProfile } from '@/lib/types';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Apple, ClipboardPlus, Trash2, AlertCircle, LinkIcon, Edit, Users, User as UserIcon } from 'lucide-react';
 import Image from 'next/image';
 import { format, parseISO } from 'date-fns';
 import { de } from 'date-fns/locale';
-import { useToast } from "@/hooks/use-toast";
+import { useToast } from "@/components/ui/use-toast";
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
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import { Skeleton } from "@/components/ui/skeleton";
 import { FoodLogForm } from '@/components/forms/FoodLogForm';
 import { SymptomLogForm } from '@/components/forms/SymptomLogForm';
 
 
 type TimelineItem = (FoodEntry & { type: 'food' }) | (SymptomEntry & { type: 'symptom' });
 
 export function TimelineDisplay() {
