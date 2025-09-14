diff --git a/src/components/forms/NewUserProfileForm.tsx b/src/components/forms/NewUserProfileForm.tsx
index 2fd884dc9aa1adf4de7c03e4271b5c536c31df6b..4defa62c21dcb3a2339eed8ab50bfa8c963bacad 100644
--- a/src/components/forms/NewUserProfileForm.tsx
+++ b/src/components/forms/NewUserProfileForm.tsx
@@ -1,46 +1,46 @@
 
 'use client';
 
 import { zodResolver } from '@hookform/resolvers/zod';
 import { useForm } from 'react-hook-form';
 import * as z from 'zod';
 import { useEffect } from 'react';
 import { Button } from '@/components/ui/button';
 import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
 } from '@/components/ui/form';
 import { Input } from '@/components/ui/input';
 import { Save } from 'lucide-react';
 import { addUserProfile, updateUserProfile } from '@/lib/data-service';
 import type { UserProfile } from '@/lib/types';
-import { useToast } from '@/hooks/use-toast';
+import { useToast } from '@/components/ui/use-toast';
 
 const userProfileFormSchema = z.object({
   name: z.string().min(1, { message: 'Bitte geben Sie einen Namen ein.' }),
 });
 
 type UserProfileFormValues = z.infer<typeof userProfileFormSchema>;
 
 interface NewUserProfileFormProps {
   profileToEdit?: UserProfile | null;
   onFormSubmit: () => void;
 }
 
 export function NewUserProfileForm({ profileToEdit, onFormSubmit }: NewUserProfileFormProps) {
   const { toast } = useToast();
   const form = useForm<UserProfileFormValues>({
     resolver: zodResolver(userProfileFormSchema),
     defaultValues: {
       name: profileToEdit?.name || '',
     },
     mode: 'onChange',
   });
 
   useEffect(() => {
     form.reset({ name: profileToEdit?.name || '' });
   }, [profileToEdit, form]);
