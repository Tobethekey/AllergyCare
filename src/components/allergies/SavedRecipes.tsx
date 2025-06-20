'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Clock, Users, Trash2, ChefHat } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SavedRecipe } from '@/lib/types';

export function SavedRecipes() {
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  // Mock-Daten für Entwicklung
  useEffect(() => {
    // Hier würde später der API-Call stehen
    // loadSavedRecipes();
    
    // Mock-Daten
    const mockRecipes: SavedRecipe[] = [
      {
        id: '1',
        title: 'Glutenfreie Pasta mit Gemüse',
        description: 'Eine leckere, allergikerfreundliche Pasta mit frischem Gemüse',
        ingredients: ['Glutenfreie Pasta', 'Zucchini', 'Paprika', 'Olivenöl', 'Knoblauch', 'Basilikum'],
        instructions: '1. Pasta kochen\n2. Gemüse anbraten\n3. Zusammen servieren',
        mealType: 'Mittagessen',
        allergyFriendly: ['Gluten'],
        createdAt: '2025-01-15T10:00:00Z',
        generatedByAI: true,
        aiExplanation: 'Normale Pasta durch glutenfreie Pasta ersetzt'
      }
    ];
    setRecipes(mockRecipes);
  }, []);

  const handleDeleteRecipe = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie dieses Rezept löschen möchten?')) {
      return;
    }

    try {
      // API-Call zum Löschen
      setRecipes(prev => prev.filter(r => r.id !== id));
      
      toast({
        title: "Rezept gelöscht",
        description: "Das Rezept wurde erfolgreich entfernt."
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Das Rezept konnte nicht gelöscht werden.",
        variant: "destructive"
      });
    }
  };

  const toggleRecipeExpansion = (id: string) => {
    setExpandedRecipe(expandedRecipe === id ? null : id);
  };

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="font-medium mb-2">Keine gespeicherten Rezepte</h3>
        <p className="text-sm">Generieren Sie Ihr erstes Rezept oben, um es hier zu speichern.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <Card key={recipe.id} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight">{recipe.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {recipe.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteRecipe(recipe.id)}
                  className="text-muted-foreground hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <Badge variant="outline">{recipe.mealType}</Badge>
                {recipe.generatedByAI && (
                  <div className="flex items-center gap-1">
                    <ChefHat className="h-3 w-3" />
                    <span>KI-generiert</span>
                  </div>
                )}
              </div>
              
              {recipe.allergyFriendly.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {recipe.allergyFriendly.map(allergy => (
                    <Badge key={allergy} variant="secondary" className="text-xs">
                      {allergy}-frei
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            
            <CardContent className="pt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleRecipeExpansion(recipe.id)}
                className="w-full"
              >
                {expandedRecipe === recipe.id ? 'Zuklappen' : 'Rezept anzeigen'}
              </Button>
              
              {expandedRecipe === recipe.id && (
                <div className="mt-4 space-y-4">
                  <Separator />
                  
                  {/* Zutaten */}
                  <div>
                    <h4 className="font-medium mb-2">Zutaten</h4>
                    <ul className="space-y-1 text-sm">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span>{ingredient}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  {/* Zubereitung */}
                  <div>
                    <h4 className="font-medium mb-2">Zubereitung</h4>
                    <div className="text-sm whitespace-pre-line leading-relaxed">
                      {recipe.instructions}
                    </div>
                  </div>
                  
                  {/* KI-Erklärung */}
                  {recipe.aiExplanation && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2 text-blue-700">Anpassungen</h4>
                        <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                          {recipe.aiExplanation}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}