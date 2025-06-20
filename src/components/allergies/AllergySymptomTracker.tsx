'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Clock,
  AlertTriangle,
  Activity,
  Calendar,
  User,
  Save,
  X,
  Link as LinkIcon,
  TrendingUp,
  Filter,
  Eye,
  Target
} from 'lucide-react';
import { 
  getUserProfiles, 
  getSymptomEntries, 
  getFoodEntries,
  addSymptomEntry,
  updateSymptomEntry,
  deleteSymptomEntry,
  getFoodEntryById
} from '@/lib/data-service';
import type { 
  UserProfile, 
  SymptomEntry, 
  FoodEntry, 
  SymptomCategory, 
  SymptomSeverity,
  symptomCategories,
  symptomSeverities
} from '@/lib/types';
import { format, parseISO, isValid, subDays, isAfter } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

interface SymptomFormData {
  symptom: string;
  category: SymptomCategory;
  severity: SymptomSeverity;
  startTime: string;
  duration: string;
  profileId: string;
  linkedFoodEntryId?: string;
  allergenTrigger?: string; // Neues Feld für direkte Allergen-Zuordnung
  notes?: string;
}

interface AllergySymptomTrackerProps {
  selectedProfileId?: string;
  selectedAllergen?: string;
  onSymptomAdded?: (symptom: SymptomEntry) => void;
  showQuickAdd?: boolean;
}

export function AllergySymptomTracker({ 
  selectedProfileId,
  selectedAllergen,
  onSymptomAdded,
  showQuickAdd = true
}: AllergySymptomTrackerProps) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSymptom, setEditingSymptom] = useState<SymptomEntry | null>(null);
  const [filterProfileId, setFilterProfileId] = useState<string>(selectedProfileId || 'all');
  const [filterAllergen, setFilterAllergen] = useState<string>(selectedAllergen || '');
  const [filterTimeRange, setFilterTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState<SymptomFormData>({
    symptom: '',
    category: 'Hautreaktionen',
    severity: 'Leicht',
    startTime: new Date().toISOString().slice(0, 16),
    duration: '',
    profileId: selectedProfileId || '',
    linkedFoodEntryId: '',
    allergenTrigger: selectedAllergen || '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProfileId) {
      setFilterProfileId(selectedProfileId);
      setFormData(prev => ({ ...prev, profileId: selectedProfileId }));
    }
  }, [selectedProfileId]);

  useEffect(() => {
    if (selectedAllergen) {
      setFilterAllergen(selectedAllergen);
      setFormData(prev => ({ ...prev, allergenTrigger: selectedAllergen }));
    }
  }, [selectedAllergen]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const profilesData = getUserProfiles();
      const symptomsData = getSymptomEntries();
      const foodData = getFoodEntries();
      
      setProfiles(profilesData);
      setSymptoms(symptomsData);
      setFoodEntries(foodData);

      // Set default profile if only one exists
      if (profilesData.length === 1 && !formData.profileId) {
        setFormData(prev => ({ ...prev, profileId: profilesData[0].id }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      symptom: '',
      category: 'Hautreaktionen',
      severity: 'Leicht',
      startTime: new Date().toISOString().slice(0, 16),
      duration: '',
      profileId: selectedProfileId || (profiles.length === 1 ? profiles[0].id : ''),
      linkedFoodEntryId: '',
      allergenTrigger: selectedAllergen || '',
      notes: ''
    });
    setEditingSymptom(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.profileId) {
      toast.error('Bitte wählen Sie ein Profil aus');
      return;
    }

    if (!formData.symptom.trim()) {
      toast.error('Bitte geben Sie eine Symptom-Beschreibung ein');
      return;
    }

    try {
      let savedSymptom: SymptomEntry;

      if (editingSymptom) {
        // Update existing symptom
        const updated = updateSymptomEntry(editingSymptom.id, {
          symptom: formData.symptom,
          category: formData.category,
          severity: formData.severity,
          startTime: formData.startTime,
          duration: formData.duration,
          profileId: formData.profileId,
          linkedFoodEntryId: formData.linkedFoodEntryId || undefined
        });

        if (!updated) {
          throw new Error('Symptom konnte nicht aktualisiert werden');
        }
        savedSymptom = updated;
        toast.success('Symptom wurde aktualisiert');
      } else {
        // Add new symptom
        savedSymptom = addSymptomEntry({
          symptom: formData.symptom,
          category: formData.category,
          severity: formData.severity,
          startTime: formData.startTime,
          duration: formData.duration,
          profileId: formData.profileId,
          linkedFoodEntryId: formData.linkedFoodEntryId || undefined
        });
        toast.success('Symptom wurde hinzugefügt');
      }

      // Reload data and notify parent
      await loadData();
      onSymptomAdded?.(savedSymptom);
      
      // Reset form and close
      resetForm();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving symptom:', error);
      toast.error('Fehler beim Speichern des Symptoms');
    }
  };

  const handleEdit = (symptom: SymptomEntry) => {
    setFormData({
      symptom: symptom.symptom,
      category: symptom.category,
      severity: symptom.severity,
      startTime: symptom.startTime,
      duration: symptom.duration,
      profileId: symptom.profileId,
      linkedFoodEntryId: symptom.linkedFoodEntryId || '',
      allergenTrigger: filterAllergen,
      notes: ''
    });
    setEditingSymptom(symptom);
    setIsFormOpen(true);
  };

  const handleDelete = async (symptomId: string) => {
    if (!confirm('Möchten Sie dieses Symptom wirklich löschen?')) {
      return;
    }

    try {
      deleteSymptomEntry(symptomId);
      await loadData();
      toast.success('Symptom wurde gelöscht');
    } catch (error) {
      console.error('Error deleting symptom:', error);
      toast.error('Fehler beim Löschen des Symptoms');
    }
  };

  const getFilteredSymptoms = () => {
    let filtered = symptoms;

    // Filter by profile
    if (filterProfileId !== 'all') {
      filtered = filtered.filter(s => s.profileId === filterProfileId);
    }

    // Filter by allergen (search in symptom description or notes)
    if (filterAllergen) {
      filtered = filtered.filter(s => 
        s.symptom.toLowerCase().includes(filterAllergen.toLowerCase())
      );
    }

    // Filter by time range
    const now = new Date();
    switch (filterTimeRange) {
      case 'today':
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        filtered = filtered.filter(s => {
          const symptomDate = parseISO(s.startTime);
          return isValid(symptomDate) && isAfter(symptomDate, startOfDay);
        });
        break;
      case 'week':
        const oneWeekAgo = subDays(now, 7);
        filtered = filtered.filter(s => {
          const symptomDate = parseISO(s.startTime);
          return isValid(symptomDate) && isAfter(symptomDate, oneWeekAgo);
        });
        break;
      case 'month':
        const oneMonthAgo = subDays(now, 30);
        filtered = filtered.filter(s => {
          const symptomDate = parseISO(s.startTime);
          return isValid(symptomDate) && isAfter(symptomDate, oneMonthAgo);
        });
        break;
    }

    return filtered.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  };

  const getRecentFoodEntries = () => {
    const profileIds = filterProfileId === 'all' 
      ? profiles.map(p => p.id)
      : [filterProfileId];

    const threeDaysAgo = subDays(new Date(), 3);
    
    return foodEntries
      .filter(entry => 
        entry.profileIds.some(id => profileIds.includes(id)) &&
        isValid(parseISO(entry.timestamp)) &&
        isAfter(parseISO(entry.timestamp), threeDaysAgo)
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  };

  const getProfileName = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    return profile?.name || 'Unbekannt';
  };

  const getSeverityColor = (severity: SymptomSeverity) => {
    switch (severity) {
      case 'Schwer': return 'bg-red-100 text-red-800 border-red-200';
      case 'Mittel': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getCategoryIcon = (category: SymptomCategory) => {
    switch (category) {
      case 'Hautreaktionen': return '🔴';
      case 'Magen-Darm': return '🟡';
      case 'Atmung': return '🔵';
      case 'Allgemeinzustand': return '🟣';
      default: return '⚪';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  const filteredSymptoms = getFilteredSymptoms();
  const recentFoodEntries = getRecentFoodEntries();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Symptom-Tracker</h2>
          <p className="text-gray-600">
            {selectedAllergen ? `Symptome für ${selectedAllergen}` : 'Allergie-bezogene Symptome verfolgen'}
          </p>
        </div>
        {showQuickAdd && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Symptom hinzufügen
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heute</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {symptoms.filter(s => {
                const today = new Date();
                const startOfDay = new Date(today.setHours(0, 0, 0, 0));
                const symptomDate = parseISO(s.startTime);
                return isValid(symptomDate) && isAfter(symptomDate, startOfDay);
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Symptome</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diese Woche</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSymptoms.length}</div>
            <p className="text-xs text-muted-foreground">Gefilterte Symptome</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schwer</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredSymptoms.filter(s => s.severity === 'Schwer').length}
            </div>
            <p className="text-xs text-muted-foreground">Schwere Symptome</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verlinkungen</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredSymptoms.filter(s => s.linkedFoodEntryId).length}
            </div>
            <p className="text-xs text-muted-foreground">Mit Essen verknüpft</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Ansicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="profile-filter">Profil</Label>
              <select
                id="profile-filter"
                value={filterProfileId}
                onChange={(e) => setFilterProfileId(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Alle Profile</option>
                {profiles.map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="allergen-filter">Allergen</Label>
              <Input
                id="allergen-filter"
                placeholder="z.B. Nuss, Milch..."
                value={filterAllergen}
                onChange={(e) => setFilterAllergen(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="time-filter">Zeitraum</Label>
              <select
                id="time-filter"
                value={filterTimeRange}
                onChange={(e) => setFilterTimeRange(e.target.value as any)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Heute</option>
                <option value="week">Diese Woche</option>
                <option value="month">Dieser Monat</option>
                <option value="all">Alle</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Eye className="mr-2 h-4 w-4" />
                Erweitert
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{editingSymptom ? 'Symptom bearbeiten' : 'Neues Symptom hinzufügen'}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="profile">Profil *</Label>
                  <select
                    id="profile"
                    value={formData.profileId}
                    onChange={(e) => setFormData(prev => ({ ...prev, profileId: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Profil auswählen</option>
                    {profiles.map(profile => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="allergen-trigger">Verdächtiges Allergen</Label>
                  <Input
                    id="allergen-trigger"
                    placeholder="z.B. Erdnuss, Laktose..."
                    value={formData.allergenTrigger}
                    onChange={(e) => setFormData(prev => ({ ...prev, allergenTrigger: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="symptom">Symptom-Beschreibung *</Label>
                <Textarea
                  id="symptom"
                  placeholder="Beschreiben Sie das Symptom..."
                  value={formData.symptom}
                  onChange={(e) => setFormData(prev => ({ ...prev, symptom: e.target.value }))}
                  className="mt-1"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="category">Kategorie</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as SymptomCategory }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {symptomCategories.map(category => (
                      <option key={category} value={category}>
                        {getCategoryIcon(category)} {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="severity">Schweregrad</Label>
                  <select
                    id="severity"
                    value={formData.severity}
                    onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value as SymptomSeverity }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {symptomSeverities.map(severity => (
                      <option key={severity} value={severity}>
                        {severity}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="duration">Dauer</Label>
                  <Input
                    id="duration"
                    placeholder="z.B. 30 Min, 2 Std..."
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="start-time">Beginn</Label>
                  <Input
                    id="start-time"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="linked-food">Möglicherweise verknüpftes Essen</Label>
                  <select
                    id="linked-food"
                    value={formData.linkedFoodEntryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedFoodEntryId: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Kein Essen verknüpfen</option>
                    {recentFoodEntries.map(entry => (
                      <option key={entry.id} value={entry.id}>
                        {entry.foodItems} ({format(parseISO(entry.timestamp), 'dd.MM HH:mm', { locale: de })})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                  }}
                >
                  Abbrechen
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {editingSymptom ? 'Aktualisieren' : 'Hinzufügen'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Symptoms List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Symptom-Verlauf
            <Badge variant="secondary">{filteredSymptoms.length}</Badge>
          </CardTitle>
          <CardDescription>
            {filterTimeRange === 'today' ? 'Heutige Symptome' :
             filterTimeRange === 'week' ? 'Symptome der letzten 7 Tage' :
             filterTimeRange === 'month' ? 'Symptome der letzten 30 Tage' :
             'Alle aufgezeichneten Symptome'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSymptoms.length > 0 ? (
            <div className="space-y-4">
              {filteredSymptoms.map(symptom => {
                const linkedFood = symptom.linkedFoodEntryId 
                  ? getFoodEntryById(symptom.linkedFoodEntryId)
                  : null;

                return (
                  <div key={symptom.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg">{getCategoryIcon(symptom.category)}</span>
                          <div>
                            <h4 className="font-medium">{symptom.symptom}</h4>
                            <p className="text-sm text-gray-600">
                              {symptom.category} • {getProfileName(symptom.profileId)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(parseISO(symptom.startTime), 'dd.MM.yyyy HH:mm', { locale: de })}
                          </span>
                          {symptom.duration && (
                            <span>Dauer: {symptom.duration}</span>
                          )}
                        </div>

                        {linkedFood && (
                          <div className="flex items-center gap-2 mt-2">
                            <LinkIcon className="h-3 w-3 text-blue-500" />
                            <span className="text-sm text-blue-600">
                              Verknüpft mit: {linkedFood.foodItems}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(symptom.severity)}>
                          {symptom.severity}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(symptom)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(symptom.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Keine Symptome gefunden
              </h3>
              <p className="text-gray-500 mb-4">
                {filterAllergen 
                  ? `Keine Symptome für "${filterAllergen}" gefunden`
                  : 'Noch keine Symptome aufgezeichnet'
                }
              </p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Erstes Symptom hinzufügen
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
