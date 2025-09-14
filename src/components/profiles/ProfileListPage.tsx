diff --git a/src/components/profiles/ProfileListPage.tsx b/src/components/profiles/ProfileListPage.tsx
index b030e2026301e443648ca53e7a99bf0c13a27ede..5be9dc255718e235d0662328d3cb01ccf0b30649 100644
--- a/src/components/profiles/ProfileListPage.tsx
+++ b/src/components/profiles/ProfileListPage.tsx
@@ -1,51 +1,51 @@
 'use client';
 
 import { useState, useEffect } from 'react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
 } from '@/components/ui/alert-dialog';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from '@/components/ui/dialog';
 import { PlusCircle, Edit, Trash2, AlertCircle, User as UserIcon } from 'lucide-react';
 import { getUserProfiles, deleteUserProfile } from '@/lib/data-service';
 import type { UserProfile } from '@/lib/types';
-import { useToast } from '@/hooks/use-toast';
+import { useToast } from '@/components/ui/use-toast';
 import { ExtendedUserProfileForm } from '@/components/forms/ExtendedUserProfileForm';
 
 export function ProfileListPage() {
   const [profiles, setProfiles] = useState<UserProfile[]>([]);
   const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
   const [isFormOpen, setIsFormOpen] = useState(false);
   const { toast } = useToast();
 
   const fetchProfiles = () => {
     setProfiles(getUserProfiles());
   };
 
   useEffect(() => {
     fetchProfiles();
   }, []);
 
   const handleAddProfile = () => {
     setEditingProfile(null);
     setIsFormOpen(true);
   };
 
   const handleEditProfile = (profile: UserProfile) => {
     setEditingProfile(profile);
     setIsFormOpen(true);
   };
