"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { addFoodLog } from "@/lib/local-storage";

const formSchema = z.object({
  date: z.string().min(1, "Datum ist erforderlich"),
  foodItems: z.string().min(1, "Nahrungsmittel ist erforderlich"),
});

export function FoodLogForm() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().substring(0, 16),
      foodItems: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newLog = {
      date: new Date(values.date).toISOString(),
      foodItems: values.foodItems.split(',').map(item => item.trim()),
    };
    
    addFoodLog(newLog);

    toast({
      title: "Gespeichert",
      description: "Mahlzeit wurde erfolgreich hinzugefügt.",
    });
    
    // WICHTIG: Seite neu laden, damit alle Komponenten die neuen Daten sehen
    setTimeout(() => {
        window.location.reload();
    }, 500); // Kurze Verzögerung, damit der Toast sichtbar ist
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Datum und Uhrzeit</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="foodItems"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nahrungsmittel (durch Komma getrennt)</FormLabel>
              <FormControl>
                <Input placeholder="z.B. Apfel, Brot, Käse" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Mahlzeit speichern</Button>
      </form>
    </Form>
  );
}
