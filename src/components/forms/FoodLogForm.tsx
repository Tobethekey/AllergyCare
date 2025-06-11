
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
import { Utensils, XCircle, ImageOff, Users } from 'lucide-react';
import { addFoodEntry, updateFoodEntry, getUserProfiles } from '@/lib/data-service';
import type { FoodEntry, UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import type React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const foodLogFormSchema = z.object({
  foodItems: z.string().min(2, {
    message: 'Bitte geben Sie mindestens ein Nahrungsmittel an.',
  }),
  photoFile: z.instanceof(File).optional().nullable(),
  profileIds: z.array(z.string()).min(1, { // Must select at least one profile
    message: 'Bitte wählen Sie mindestens ein Profil aus.',
  }),
});

type FoodLogFormValues = z.infer<typeof foodLogFormSchema>;

interface FoodLogFormProps {
  entryToEdit?: FoodEntry;
  onFormSubmit: () => void;
}

export function FoodLogForm({ entryToEdit, onFormSubmit }: FoodLogFormProps) {
  const { toast } = useToast();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null | undefined>(null);
  const [availableProfiles, setAvailableProfiles] = useState<UserProfile[]>([]);

  useEffect(() => {
    setAvailableProfiles(getUserProfiles());
  }, []);

  const defaultValues: Partial<FoodLogFormValues> = {
    foodItems: entryToEdit?.foodItems || '',
    photoFile: undefined,
    profileIds: entryToEdit?.profileIds || [],
  };

  const form = useForm<FoodLogFormValues>({
    resolver: zodResolver(foodLogFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  useEffect(() => {
    if (entryToEdit) {
      form.reset({
        foodItems: entryToEdit.foodItems,
        photoFile: undefined,
        profileIds: entryToEdit.profileIds || [],
      });
      setPhotoPreview(entryToEdit.photo || null);
      setExistingPhotoUrl(entryToEdit.photo);
    } else {
      form.reset(defaultValues);
      setPhotoPreview(null);
      setExistingPhotoUrl(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryToEdit, form.reset]);


  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('photoFile', file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else { 
      form.setValue('photoFile', undefined); 
      setPhotoPreview(existingPhotoUrl || null); 
    }
  };

  const handleRemovePhoto = () => {
    form.setValue('photoFile', null, { shouldValidate: true }); 
    setPhotoPreview(null);
  };

  async function onSubmit(data: FoodLogFormValues) {
    let finalPhotoDataUrl: string | undefined = existingPhotoUrl || undefined;

    if (data.photoFile === null) { 
      finalPhotoDataUrl = undefined;
    } else if (data.photoFile) { 
      finalPhotoDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(data.photoFile as File);
      });
    }
    
    const foodDataPayload = { 
        foodItems: data.foodItems, 
        photo: finalPhotoDataUrl, 
        profileIds: data.profileIds 
    };

    if (entryToEdit) {
      updateFoodEntry(entryToEdit.id, foodDataPayload);
      toast({
        title: 'Mahlzeit aktualisiert',
        description: 'Ihre Mahlzeit wurde erfolgreich geändert.',
      });
    } else {
      addFoodEntry(foodDataPayload);
      toast({
        title: 'Mahlzeit gespeichert',
        description: 'Ihre Mahlzeit wurde erfolgreich dokumentiert.',
      });
    }
    onFormSubmit(); 
    form.reset(defaultValues);
    setPhotoPreview(null);
    setExistingPhotoUrl(null);
  }

  const currentPhotoToDisplay = form.getValues('photoFile') === null ? null : photoPreview;


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="profileIds"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Für welche Profile gilt diese Mahlzeit?
                </FormLabel>
                <FormDescription>
                  Wählen Sie alle zutreffenden Profile aus.
                </FormDescription>
              </div>
              {availableProfiles.length === 0 && (
                <div className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
                  Noch keine Profile angelegt. Bitte erstellen Sie zuerst Profile unter{' '}
                  <Link href="/profiles" className="underline hover:text-primary">Profile verwalten</Link>.
                </div>
              )}
              {availableProfiles.map((profile) => (
                <FormField
                  key={profile.id}
                  control={form.control}
                  name="profileIds"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={profile.id}
                        className="flex flex-row items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(profile.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), profile.id])
                                : field.onChange(
                                    (field.value || []).filter(
                                      (value) => value !== profile.id
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {profile.name}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
              <FormMessage />
            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name="foodItems"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nahrungsmittel</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="z.B. Apfel, Banane, Hühnchen mit Reis"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Listen Sie alle konsumierten Nahrungsmittel auf.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photoFile"
          render={() => (
            <FormItem>
              <FormLabel>Foto der Mahlzeit (optional)</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={handlePhotoChange} />
              </FormControl>
              <FormDescription>
                Machen Sie ein Foto Ihrer Mahlzeit für eine bessere Dokumentation.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {currentPhotoToDisplay && (
          <div className="mt-4">
            <FormLabel>Fotovorschau</FormLabel>
            <div className="mt-2 relative w-full max-w-sm h-64 rounded-md overflow-hidden border border-input">
              <Image src={currentPhotoToDisplay} alt="Fotovorschau" layout="fill" objectFit="cover" data-ai-hint="food meal"/>
               <Button 
                  type="button" 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 z-10 opacity-75 hover:opacity-100"
                  onClick={handleRemovePhoto}
                  aria-label="Foto entfernen"
                >
                  <XCircle className="h-5 w-5" />
                </Button>
            </div>
          </div>
        )}
         {entryToEdit && existingPhotoUrl && !currentPhotoToDisplay && form.getValues('photoFile') !== null && (
           <p className="text-sm text-muted-foreground flex items-center gap-1">
             <ImageOff className="h-4 w-4" /> Bisheriges Foto wurde entfernt. Speichern, um die Änderung zu übernehmen.
           </p>
         )}
        
        <div className="flex justify-end">
          <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={availableProfiles.length === 0 && !entryToEdit}>
            <Utensils className="mr-2 h-4 w-4" /> {entryToEdit ? 'Änderungen speichern' : 'Mahlzeit speichern'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
