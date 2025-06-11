
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
import { HeartPulse, LinkIcon } from 'lucide-react';
import { addSymptomEntry, getFoodEntries } from '@/lib/data-service';
import type { FoodEntry, SymptomCategory, SymptomSeverity } from '@/lib/types';
import { symptomCategories, symptomSeverities } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

const getLocalDateTimeString = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000; // Offset in milliseconds
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().substring(0, 16);
};

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
});

type SymptomLogFormValues = z.infer<typeof symptomLogFormSchema>;

const defaultValues: Partial<SymptomLogFormValues> = {
  symptom: '',
  startTime: getLocalDateTimeString(),
  duration: '',
  linkedFoodEntryId: '', // Empty string for "none" option
};

export function SymptomLogForm() {
  const { toast } = useToast();
  const [recentFoodEntries, setRecentFoodEntries] = useState<FoodEntry[]>([]);

  const form = useForm<SymptomLogFormValues>({
    resolver: zodResolver(symptomLogFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  useEffect(() => {
    const allFood = getFoodEntries();
    const sortedFood = allFood.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setRecentFoodEntries(sortedFood.slice(0, 15)); // Get latest 15 meals
  }, []);

  function onSubmit(data: SymptomLogFormValues) {
    addSymptomEntry({
      ...data,
      linkedFoodEntryId: data.linkedFoodEntryId === '' ? undefined : data.linkedFoodEntryId,
    });
    toast({
      title: 'Symptom gespeichert',
      description: 'Ihr Symptom wurde erfolgreich dokumentiert.',
    });
    form.reset({
      ...defaultValues,
      startTime: getLocalDateTimeString(), // Ensure startTime is reset to current local time
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Kürzliche Mahlzeit auswählen..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Keine Mahlzeit verknüpfen</SelectItem>
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
          <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <HeartPulse className="mr-2 h-4 w-4" /> Symptom speichern
          </Button>
        </div>
      </form>
    </Form>
  );
}
