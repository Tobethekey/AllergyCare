
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HeartPulse, LinkIcon, User as UserIcon } from 'lucide-react';
import { addSymptomEntry, getFoodEntries, updateSymptomEntry, getUserProfiles } from '@/lib/data-service';
import type { FoodEntry, SymptomCategory, SymptomSeverity, SymptomEntry as SymptomEntryType, UserProfile } from '@/lib/types';
import { symptomCategories, symptomSeverities } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
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

const UNLINKED_FOOD_VALUE = "___UNLINKED___";

const symptomLogFormSchema = z.object({
  symptom: z.string().min(2, {
    message: 'Bitte beschreiben Sie das Symptom.',
  }),
  category: z.enum(symptomCategories, {
    required_error: 'Bitte wählen Sie eine Kategorie aus.',
  }),
  severity: z.enum(symptomSeverities, {
    required_error: 'Bitte wählen Sie den Schweregrad aus.',
  }),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Bitte geben Sie ein gültiges Startdatum und eine gültige Startzeit an.',
  }),
  duration: z.string().min(1, {
    message: 'Bitte geben Sie die Dauer an (z.B. "2 Stunden", "30 Minuten", "anhaltend").',
  }),
  linkedFoodEntryId: z.string().optional(),
  profileId: z.string({ required_error: 'Bitte wählen Sie ein Profil aus.'}).min(1, {message: 'Bitte wählen Sie ein Profil aus.'}),
});

type SymptomLogFormValues = z.infer<typeof symptomLogFormSchema>;

interface SymptomLogFormProps {
  entryToEdit?: SymptomEntryType;
  onFormSubmit: () => void;
}


export function SymptomLogForm({ entryToEdit, onFormSubmit }: SymptomLogFormProps) {
  const { toast } = useToast();
  const [recentFoodEntries, setRecentFoodEntries] = useState<FoodEntry[]>([]);
  const [availableProfiles, setAvailableProfiles] = useState<UserProfile[]>([]);

  useEffect(() => {
    setAvailableProfiles(getUserProfiles());
    const allFood = getFoodEntries();
    const sortedFood = allFood.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setRecentFoodEntries(sortedFood.slice(0, 15)); 
  }, []);


  const getInitialDefaultValues = (): Partial<SymptomLogFormValues> => ({
    symptom: entryToEdit?.symptom || '',
    category: entryToEdit?.category,
    severity: entryToEdit?.severity,
    startTime: getLocalDateTimeString(entryToEdit?.startTime),
    duration: entryToEdit?.duration || '',
    linkedFoodEntryId: entryToEdit?.linkedFoodEntryId || UNLINKED_FOOD_VALUE,
    profileId: entryToEdit?.profileId || '',
  });


  const form = useForm<SymptomLogFormValues>({
    resolver: zodResolver(symptomLogFormSchema),
    defaultValues: getInitialDefaultValues(),
    mode: 'onChange',
  });

  useEffect(() => {
    form.reset(getInitialDefaultValues());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryToEdit, form.reset]);

  function onSubmit(data: SymptomLogFormValues) {
    const symptomDataPayload = {
      ...data,
      startTime: new Date(data.startTime).toISOString(), 
      linkedFoodEntryId: data.linkedFoodEntryId === UNLINKED_FOOD_VALUE ? undefined : data.linkedFoodEntryId,
    };

    if (entryToEdit) {
      updateSymptomEntry(entryToEdit.id, symptomDataPayload);
      toast({
        title: 'Symptom aktualisiert',
        description: 'Ihr Symptom wurde erfolgreich geändert.',
      });
    } else {
      addSymptomEntry(symptomDataPayload);
      toast({
        title: 'Symptom gespeichert',
        description: 'Ihr Symptom wurde erfolgreich dokumentiert.',
      });
    }
    onFormSubmit(); 
     form.reset({ 
      symptom: '',
      category: undefined,
      severity: undefined,
      startTime: getLocalDateTimeString(),
      duration: '',
      linkedFoodEntryId: UNLINKED_FOOD_VALUE,
      profileId: '',
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="profileId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <UserIcon className="h-4 w-4 text-primary" />
                Für welches Profil gilt dieses Symptom?
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Profil auswählen..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableProfiles.length === 0 && (
                    <SelectItem value="no-profile" disabled>
                      Keine Profile vorhanden.
                    </SelectItem>
                  )}
                  {availableProfiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableProfiles.length === 0 && (
                 <FormDescription>
                  Bitte erstellen Sie zuerst Profile unter{' '}
                  <Link href="/profiles" className="underline hover:text-primary">Profile verwalten</Link>.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="symptom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symptombeschreibung</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="z.B. Hautausschlag am Arm, Bauchschmerzen, Husten"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Beschreiben Sie das aufgetretene Symptom.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategorie</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategorie auswählen" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {symptomCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="severity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Schweregrad</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Schweregrad auswählen" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {symptomSeverities.map((sev) => (
                      <SelectItem key={sev} value={sev}>{sev}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beginn (Datum und Uhrzeit)</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dauer</FormLabel>
                <FormControl>
                  <Input placeholder="z.B. 2 Stunden, 30 Min., anhaltend" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="linkedFoodEntryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                Mahlzeit verknüpfen (optional)
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value || UNLINKED_FOOD_VALUE} defaultValue={field.value || UNLINKED_FOOD_VALUE}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Kürzliche Mahlzeit auswählen..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={UNLINKED_FOOD_VALUE}>Keine Mahlzeit verknüpfen</SelectItem>
                  {recentFoodEntries.map((food) => (
                    <SelectItem key={food.id} value={food.id}>
                      {new Date(food.timestamp).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} Uhr - {food.foodItems.substring(0, 40)}{food.foodItems.length > 40 ? '...' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Wählen Sie eine kürzlich protokollierte Mahlzeit, die mit diesem Symptom in Verbindung stehen könnte.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={availableProfiles.length === 0 && !entryToEdit}>
            <HeartPulse className="mr-2 h-4 w-4" /> {entryToEdit ? 'Änderungen speichern' : 'Symptom speichern'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
