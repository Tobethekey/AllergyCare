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
import { getUserProfile, saveUserProfile } from '@/lib/data-service';
import type { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const userProfileFormSchema = z.object({
  name: z.string().optional(),
  notes: z.string().optional(),
});

type UserProfileFormValues = z.infer<typeof userProfileFormSchema>;

export function UserProfileForm() {
  const { toast } = useToast();
  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileFormSchema),
    defaultValues: {
      name: '',
      notes: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    const profile = getUserProfile();
    form.reset(profile);
  }, [form]);

  function onSubmit(data: UserProfileFormValues) {
    saveUserProfile(data);
    toast({
      title: 'Profil gespeichert',
      description: 'Ihre Profildaten wurden erfolgreich aktualisiert.',
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
              <FormLabel>Name (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Ihr Name" {...field} />
              </FormControl>
              <FormDescription>
                Dieser Name kann in Berichten verwendet werden.
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
                  placeholder="Notizen zu bekannten Allergien, Medikamenten, etc."
                  className="resize-none h-32"
                  {...field}
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
            <Save className="mr-2 h-4 w-4" /> Profil speichern
          </Button>
        </div>
      </form>
    </Form>
  );
}
