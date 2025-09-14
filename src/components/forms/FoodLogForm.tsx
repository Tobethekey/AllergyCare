diff --git a/src/components/forms/FoodLogForm.tsx b/src/components/forms/FoodLogForm.tsx
index 8f788d556fd82033ba61a48c8dbb8c36899eb4a8..0d897672fc13bbf0a023740426ffde2217feff68 100644
--- a/src/components/forms/FoodLogForm.tsx
+++ b/src/components/forms/FoodLogForm.tsx
@@ -1,48 +1,48 @@
 'use client';
 
 import { zodResolver } from '@hookform/resolvers/zod';
 import { useForm } from 'react-hook-form';
 import * as z from 'zod';
 import { Button } from '@/components/ui/button';
 import {
   Form,
   FormControl,
   FormDescription,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
 } from '@/components/ui/form';
 import { Input } from '@/components/ui/input';
 import { Textarea } from '@/components/ui/textarea';
 import { Checkbox } from '@/components/ui/checkbox';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Utensils, XCircle, ImageOff, Users, HeartPulse } from 'lucide-react';
 import { addFoodEntry, updateFoodEntry, getUserProfiles, addSymptomEntry } from '@/lib/data-service';
 import type { FoodEntry, UserProfile } from '@/lib/types';
-import { useToast } from '@/hooks/use-toast';
+import { useToast } from '@/components/ui/use-toast';
 import type React from 'react';
 import { useState, useEffect } from 'react';
 import Image from 'next/image';
 import Link from 'next/link';
 
 const getLocalDateTimeString = (isoDateString?: string) => {
   const date = isoDateString ? new Date(isoDateString) : new Date();
   if (isNaN(date.getTime())) {
     const fallbackDate = new Date();
     const offset = fallbackDate.getTimezoneOffset() * 60000;
     const localDate = new Date(fallbackDate.getTime() - offset);
     return localDate.toISOString().substring(0, 16);
   }
   const offset = date.getTimezoneOffset() * 60000;
   const localDate = new Date(date.getTime() - offset);
   return localDate.toISOString().substring(0, 16);
 };
 
 const foodLogFormSchema = z.object({
   foodItems: z.string().min(2, {
     message: 'Bitte geben Sie mindestens ein Nahrungsmittel an.',
   }),
   photoFile: z.instanceof(File).optional().nullable(),
   profileIds: z.array(z.string()).min(1, {
     message: 'Bitte wählen Sie mindestens ein Profil aus.',
