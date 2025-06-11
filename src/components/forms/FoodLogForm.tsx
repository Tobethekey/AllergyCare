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
import { Camera, Utensils } from 'lucide-react';
import { addFoodEntry } from '@/lib/data-service';
import { useToast } from '@/hooks/use-toast';
import type React from 'react';
import { useState } from 'react';
import Image from 'next/image';

const foodLogFormSchema = z.object({
  foodItems: z.string().min(2, {
    message: 'Bitte geben Sie mindestens ein Nahrungsmittel an.',
  }),
  photoFile: z.instanceof(File).optional(),
});

type FoodLogFormValues = z.infer<typeof foodLogFormSchema>;

const defaultValues: Partial<FoodLogFormValues> = {
  foodItems: '',
};

export function FoodLogForm() {
  const { toast } = useToast();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<FoodLogFormValues>({
    resolver: zodResolver(foodLogFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('photoFile', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      form.setValue('photoFile', undefined);
      setPhotoPreview(null);
    }
  };

  async function onSubmit(data: FoodLogFormValues) {
    let photoDataUrl: string | undefined = undefined;
    if (data.photoFile) {
      photoDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(data.photoFile as File);
      });
    }

    addFoodEntry({ foodItems: data.foodItems, photo: photoDataUrl });
    toast({
      title: 'Mahlzeit gespeichert',
      description: 'Ihre Mahlzeit wurde erfolgreich dokumentiert.',
    });
    form.reset();
    setPhotoPreview(null);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
          render={({ field }) => ( // field is not directly used for value, but onChange is
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

        {photoPreview && (
          <div className="mt-4">
            <FormLabel>Fotovorschau</FormLabel>
            <div className="mt-2 relative w-full max-w-sm h-64 rounded-md overflow-hidden border border-input">
              <Image src={photoPreview} alt="Fotovorschau" layout="fill" objectFit="cover" data-ai-hint="food meal" />
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Utensils className="mr-2 h-4 w-4" /> Mahlzeit speichern
          </Button>
        </div>
      </form>
    </Form>
  );
}
