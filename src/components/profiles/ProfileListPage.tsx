
'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, User as UserIcon, AlertCircle } from 'lucide-react';
import { getUserProfiles, deleteUserProfile } from '@/lib/data-service';
import type { UserProfile } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import { NewUserProfileForm } from '@/components/forms/NewUserProfileForm';
import { useToast } from '@/hooks/use-toast';

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

  const handleDeleteProfile = (id: string) => {
    deleteUserProfile(id);
    fetchProfiles();
    toast({
      title: 'Profil gelöscht',
      description: 'Das Profil und zugehörige Verknüpfungen wurden entfernt.',
    });
  };

  const handleFormSubmitted = () => {
    fetchProfiles();
    setIsFormOpen(false);
    setEditingProfile(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleAddProfile} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-4 w-4" /> Neues Profil anlegen
        </Button>
      </div>

      {profiles.length === 0 && (
        <Card className="shadow-lg">
          <CardContent className="p-6 text-center text-muted-foreground">
            <AlertCircle className="mx-auto h-12 w-12 mb-4" />
            <p>Noch keine Profile angelegt.</p>
            <p className="text-sm">Klicken Sie auf "Neues Profil anlegen", um zu starten.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <Card key={profile.id} className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary font-headline">
                <UserIcon className="h-5 w-5" />
                {profile.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleEditProfile(profile)}>
                <Edit className="mr-1 h-3 w-3" /> Bearbeiten
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-1 h-3 w-3" /> Löschen
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Profil löschen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Möchten Sie das Profil "{profile.name}" wirklich löschen? Alle Verknüpfungen zu Mahlzeiten werden entfernt und Symptome dieses Profils gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteProfile(profile.id)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Löschen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isFormOpen} onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingProfile(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProfile ? 'Profil bearbeiten' : 'Neues Profil anlegen'}</DialogTitle>
          </DialogHeader>
          <NewUserProfileForm
            profileToEdit={editingProfile}
            onFormSubmit={handleFormSubmitted}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
