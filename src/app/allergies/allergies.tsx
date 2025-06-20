'use client';

import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AllergyManagement } from '@/components/allergies/AllergyManagement';
import { RecipeGenerator } from '@/components/allergies/RecipeGenerator';
import { SavedRecipes } from '@/components/allergies/SavedRecipes';

export default function AllergiesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Unverträglichkeiten verwalten"
        description="Erfassen Sie Ihre Allergien und Unverträglichkeiten, um passende Rezeptvorschläge zu erhalten."
      />
      
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Linke Spalte: Unverträglichkeiten verwalten */}
        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-primary">
                Meine Unverträglichkeiten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AllergyManagement />
            </CardContent>
          </Card>
        </div>

        {/* Rechte Spalte: Rezept-Generator */}
        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-primary">
                Rezept generieren
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecipeGenerator />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Volle Breite: Gespeicherte Rezepte */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-primary">
            Gespeicherte Rezepte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SavedRecipes />
        </CardContent>
      </Card>
    </div>
  );
}