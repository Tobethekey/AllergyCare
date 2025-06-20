'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Edit2, Plus, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Allergy, AllergyType, allergyTypes } from '@/lib/types';
import { validateAllergy, formatAllergyDisplayName } from '@/lib/allergy-utils';

export function AllergyManagement() {
  const { toast } = useToast();
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: '' as AllergyType,
    customName: '',
    severity: 'Mittel' as 'Leicht' | 'Mittel' | 'Schwer',
    notes: ''
  });

  // Mock-Daten für Entwicklung - später durch API-Calls ersetzen
  useEffect(() => {
    // Hier würde später der API-Call stehen
    // loadAllergiesFromAPI();
  }, []);

  const resetForm = () => {
    setFormData({
      type: '' as AllergyType,
      customName: '',
      severity: 'Mittel',
      notes: ''
    });
    setIsAddingNew(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateAllergy(formData);
    if (errors.length > 0) {
      toast({
        title: "Fehler bei der Eingabe",
        description: errors.join(', '),
        variant: "destructive"
      });
      return;
    }

    try {
      const allergyData = {
        ...formData,
        type: formData.type as AllergyType
      };

      if (editingId) {
        // Bearbeiten
        const updatedAllergy: Allergy = {
          id: editingId,
          ...allergyData,
          addedAt: allergies.find(a => a.id === editingId)?.addedAt || new Date().toISOString()
        };
        
        setAllergies(prev => prev.map(a => a.id === editingId ? updatedAllergy : a));
        
        toast({
          title: "Unverträglichkeit aktualisiert",
          description: `${formatAllergyDisplayName(updatedAllergy)} wurde erfolgreich aktualisiert.`
        });
      } else {
        // Neu hinzufügen
        const newAllergy: Allergy = {
          id: crypto.randomUUID(),
          ...allergyData,
          addedAt: new Date().toISOString()
        };
        
        setAllergies(prev => [...prev, newAllergy]);
        
        toast({
          title: "Unverträglichkeit hinzugefügt",
          description: `${formatAllergyDisplayName(newAllergy)} wurde erfolgreich hinzugefügt.`
        });
      }

      resetForm();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Es gab ein Problem beim Speichern der Unverträglichkeit.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (allergy: Allergy) => {
    setFormData({
      type: allergy.type,
      customName: allergy.customName || '',
      severity: allergy.severity,
      notes: allergy.notes || ''
    });
    setEditingId(allergy.id);
    setIsAddingNew(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Unverträglichkeit löschen möchten?')) {
      return;
    }

    try {
      setAllergies(prev => prev.filter(a => a.id !== id));
      
      toast({
        title: "Unverträglichkeit gelöscht",
        description: "Die Unverträglichkeit wurde erfolgreich entfernt."
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Es gab ein Problem beim Löschen der Unverträglichkeit.",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Leicht': return 'bg-green-100 text-green-800';
      case 'Mittel': return 'bg-yellow-100 text-yellow-800';
      case 'Schwer': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Aktuelle Unverträglichkeiten */}
      {allergies.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-muted-foreground">Ihre Unverträglichkeiten</h3>
          {allergies.map((allergy) => (
            <Card key={allergy.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{formatAllergyDisplayName(allergy)}</span>
                    <Badge variant="outline" className={getSeverityColor(allergy.severity)}>
                      {allergy.severity}
                    </Badge>
                  </div>
                  {allergy.notes && (
                    <p className="text-sm text-muted-foreground">{allergy.notes}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(allergy)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(allergy.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Hinzufügen/Bearbeiten Form */}
      {!isAddingNew ? (
        <Button onClick={() => setIsAddingNew(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Unverträglichkeit hinzufügen
        </Button>
      ) : (
        <Card className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="allergy-type">Unverträglichkeit *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as AllergyType }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie eine Unverträglichkeit" />
                </SelectTrigger>
                <SelectContent>
                  {allergyTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'Andere' && (
              <div className="space-y-2">
                <Label htmlFor="custom-name">Beschreibung *</Label>
                <Input
                  id="custom-name"
                  value={formData.customName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customName: e.target.value }))}
                  placeholder="Beschreiben Sie Ihre Unverträglichkeit"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="severity">Schweregrad *</Label>
              <Select 
                value={formData.severity} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Leicht">Leicht</SelectItem>
                  <SelectItem value="Mittel">Mittel</SelectItem>
                  <SelectItem value="Schwer">Schwer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notizen (optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Zusätzliche Informationen..."
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingId ? 'Aktualisieren' : 'Hinzufügen'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Abbrechen
              </Button>
            </div>
          </form>
        </Card>
      )}

      {allergies.length === 0 && !isAddingNew && (
        <div className="text-center py-8 text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Noch keine Unverträglichkeiten erfasst.</p>
          <p className="text-sm">Fügen Sie Ihre erste Unverträglichkeit hinzu, um personalisierte Rezepte zu erhalten.</p>
        </div>
      )}
    </div>
  );
}