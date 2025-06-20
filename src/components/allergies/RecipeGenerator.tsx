'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChefHat, Clock, Users, Lightbulb, BookmarkPlus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MealType, mealTypes, AiRecipeResponse, Allergy } from '@/lib/types';

interface RecipeGeneratorProps {
  userAllergies?: Allergy[]; // Wird später von der Parent-Komponente übergeben
}

export function RecipeGenerator({ userAllergies = [] }: RecipeGeneratorProps) {
  const { toast } = useToast();
  const [selectedMealType, setSelectedMealType] = useState<MealType | ''>('');
  const [preferences, setPreferences] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<AiRecipeResponse | null>(null);

  const handleGenerateRecipe = async () => {
    if (!selectedMealType) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie eine Essensart aus.",
        variant: "destructive"
      });
      return;
    }

    if (userAllergies.length === 0) {
      toast({
        title: "Hinweis",
        description: "Sie haben noch keine Unverträglichkeiten erfasst. Das Rezept wird allgemein erstellt.",
        variant: "default"
      });
    }

    setIsGenerating(true);
    
    try {
      // API-Call zur Rezept-Generierung
      const response = await fetch('/api/ai/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allergies: userAllergies,
          mealType: selectedMealType,
          preferences
        })
      });

      if (!response.ok) {
        throw new Error('Fehler bei der Rezept-Generierung');
      }

      const recipe: AiRecipeResponse = await response.json();
      setGeneratedRecipe(recipe);
      
      toast({
        title: "Rezept erstellt!",
        description: "Ihr allergikerfreundliches Rezept wurde erfolgreich generiert."
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Es gab ein Problem bei der Rezept-Generierung. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) return;

    try {
      // API-Call zum Speichern des Rezepts
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: 'current-user', // Später dynamisch
          recipe: {
            title: generatedRecipe.title,
            description: generatedRecipe.description,
            ingredients: generatedRecipe.ingredients,
            instructions: generatedRecipe.instructions,
            mealType: selectedMealType,
            allergyFriendly: userAllergies.map(a => a.type),
            generatedByAI: true,
            aiExplanation: generatedRecipe.substitutions?.map(s => `${s.original} → ${s.replacement}: ${s.reason}`).join('; ')
          }
        })
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern');
      }

      toast({
        title: "Rezept gespeichert!",
        description: "Das Rezept wurde zu Ihren Favoriten hinzugefügt."
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Das Rezept konnte nicht gespeichert werden.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Generator-Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="meal-type">Essensart *</Label>
          <Select value={selectedMealType} onValueChange={(value) => setSelectedMealType(value as MealType)}>
            <SelectTrigger>
              <SelectValue placeholder="Was möchten Sie zubereiten?" />
            </SelectTrigger>
            <SelectContent>
              {mealTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferences">Zusätzliche Wünsche (optional)</Label>
          <Textarea
            id="preferences"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="z.B. vegetarisch, schnell zubereitet, italienische Küche..."
            rows={3}
          />
        </div>

        {userAllergies.length > 0 && (
          <div className="space-y-2">
            <Label>Berücksichtigte Unverträglichkeiten</Label>
            <div className="flex flex-wrap gap-2">
              {userAllergies.map(allergy => (
                <Badge key={allergy.id} variant="secondary">
                  {allergy.type === 'Andere' ? allergy.customName : allergy.type}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button 
          onClick={handleGenerateRecipe} 
          disabled={isGenerating || !selectedMealType}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Rezept wird erstellt...
            </>
          ) : (
            <>
              <ChefHat className="h-4 w-4 mr-2" />
              Rezept generieren
            </>
          )}
        </Button>
      </div>

      {/* Generiertes Rezept */}
      {generatedRecipe && (
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">{generatedRecipe.title}</CardTitle>
                <p className="text-muted-foreground mt-2">{generatedRecipe.description}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSaveRecipe}>
                <BookmarkPlus className="h-4 w-4 mr-2" />
                Speichern
              </Button>
            </div>
            
            <div className="flex gap-4 text-sm text-muted-foreground">
              {generatedRecipe.estimatedTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {generatedRecipe.estimatedTime}
                </div>
              )}
              {generatedRecipe.servings && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {generatedRecipe.servings} Portion{generatedRecipe.servings > 1 ? 'en' : ''}
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Zutaten */}
            <div>
              <h3 className="font-semibold mb-3">Zutaten</h3>
              <ul className="space-y-1">
                {generatedRecipe.ingredients.map((ingredient, index) => (
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
              <h3 className="font-semibold mb-3">Zubereitung</h3>
              <div className="whitespace-pre-line text-sm leading-relaxed">
                {generatedRecipe.instructions}
              </div>
            </div>

            {/* Substitutionen */}
            {generatedRecipe.substitutions && generatedRecipe.substitutions.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Anpassungen für Ihre Unverträglichkeiten
                  </h3>
                  <div className="space-y-2">
                    {generatedRecipe.substitutions.map((sub, index) => (
                      <div key={index} className="text-sm bg-blue-50 p-3 rounded-lg">
                        <span className="font-medium">{sub.original}</span> → <span className="font-medium">{sub.replacement}</span>
                        <p className="text-muted-foreground mt-1">{sub.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {userAllergies.length === 0 && (
        <div className="text-center py-6 text-muted-foreground bg-gray-50 rounded-lg">
          <ChefHat className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="font-medium">Noch keine Unverträglichkeiten erfasst</p>
          <p className="text-sm">Fügen Sie Unverträglichkeiten hinzu, um personalisierte Rezepte zu erhalten.</p>
        </div>
      )}
    </div>
  );
}