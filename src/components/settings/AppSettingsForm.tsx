
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useEffect } from 'react';
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
import { Save } from 'lucide-react';
import { getAppSettings, saveAppSettings } from '@/lib/data-service'; // Renamed functions
import type { AppSettings } from '@/lib/types'; // Renamed type
import { useToast } from '@/hooks/use-toast';

const appSettingsFormSchema = z.object({ // Renamed schema
  name: z.string().optional(),
  notes: z.string().optional(),
});

type AppSettingsFormValues = z.infer<typeof appSettingsFormSchema>; // Renamed type

export function AppSettingsForm() { // Renamed component
  const { toast } = useToast();
  const form = useForm<AppSettingsFormValues>({ // Use renamed type
    resolver: zodResolver(appSettingsFormSchema), // Use renamed schema
    defaultValues: {
      name: '',
      notes: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    const settings = getAppSettings(); // Use renamed function
    form.reset({
      name: settings.name || '',
      notes: settings.notes || '',
    });
  }, [form]);

  function onSubmit(data: AppSettingsFormValues) { // Use renamed type
    saveAppSettings(data); // Use renamed function
    toast({
      title: 'Einstellungen gespeichert', // Toast message updated
      description: 'Ihre allgemeinen Notizen wurden erfolgreich aktualisiert.',
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Optionaler Name für Berichte</FormLabel> {/* Label changed */}
              <FormControl>
                <Input
                  placeholder="z.B. Familie Mustermann"
                  name={field.name}
                  value={field.value || ''} // Ensure value is a string
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
              </FormControl>
              <FormDescription>
                Dieser Name kann optional in Berichten verwendet werden.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allgemeine Notizen (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notizen zu bekannten Allergien, Medikamenten, etc., die für alle Profile relevant sein könnten."
                  className="resize-none h-32"
                  value={field.value || ''} // Ensure value is a string
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormDescription>
                Hier können Sie allgemeine gesundheitsbezogene Informationen festhalten.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Save className="mr-2 h-4 w-4" /> Notizen speichern {/* Button text changed */}
          </Button>
        </div>
      </form>
    </Form>
  );
}
