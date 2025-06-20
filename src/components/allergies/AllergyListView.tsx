'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Plus, 
  AlertTriangle, 
  Users, 
  Calendar,
  Trash2,
  Edit,
  Eye,
  TrendingUp,
  Activity
} from 'lucide-react';
import { getUserProfiles, getSymptomEntries, getFoodEntries } from '@/lib/data-service';
import type { UserProfile, SymptomEntry, FoodEntry } from '@/lib/types';
import { format, parseISO, isValid, subDays, isAfter } from 'date-fns';
import { de } from 'date-fns/locale';
import { AllergyDetailCard } from './AllergyDetailCard';

interface AllergyData {
  allergen: string;
  affectedProfiles: UserProfile[];
  totalOccurrences: number;
  recentSymptoms: SymptomEntry[];
  relatedFoodEntries: FoodEntry[];
  severity: 'low' | 'medium' | 'high';
  lastSymptomDate?: string;
  trend: 'increasing' | 'stable' | 'decreasing';
}

interface AllergyListViewProps {
  selectedProfileId?: string;
  onAllergySelect?: (allergen: string) => void;
  showAddButton?: boolean;
}

export function AllergyListView({ 
  selectedProfileId = 'all', 
  onAllergySelect,
  showAddButton = true 
}: AllergyListViewProps) {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'profiles' | 'symptoms' | 'recent'>('name');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [selectedAllergen, setSelectedAllergen] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const profilesData = getUserProfiles();
      const symptomsData = getSymptomEntries();
      const foodData = getFoodEntries();
      
      setProfiles(profilesData);
      setSymptoms(symptomsData);
      setFoodEntries(foodData);
    } catch (error) {
      console.error('Error loading allergy data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const allergyData = useMemo(() => {
    const filteredProfiles = selectedProfileId === 'all' 
      ? profiles 
      : profiles.filter(p => p.id === selectedProfileId);

    const allergensMap = new Map<string, AllergyData>();

    // Sammle alle Allergene aus den Profilen
    filteredProfiles.forEach(profile => {
      if (profile.knownAllergies) {
        profile.knownAllergies.forEach(allergen => {
          if (!allergensMap.has(allergen)) {
            allergensMap.set(allergen, {
              allergen,
              affectedProfiles: [],
              totalOccurrences: 0,
              recentSymptoms: [],
              relatedFoodEntries: [],
              severity: 'low',
              trend: 'stable'
            });
          }
          
          const data = allergensMap.get(allergen)!;
          data.affectedProfiles.push(profile);
          data.totalOccurrences++;
        });
      }
    });

    // Berechne Statistiken für jedes Allergen
    allergensMap.forEach((data, allergen) => {
      const profileIds = data.affectedProfiles.map(p => p.id);
      
      // Finde relevante Symptome (basierend auf Allergen-Namen in Symptom-Beschreibung)
      const relevantSymptoms = symptoms.filter(symptom => 
        profileIds.includes(symptom.profileId) &&
        (symptom.symptom.toLowerCase().includes(allergen.toLowerCase()) ||
         symptom.category === 'Hautreaktionen' || // Häufige Allergie-Symptome
         symptom.category === 'Atmung')
      );

      // Symptome der letzten 30 Tage
      const thirtyDaysAgo = subDays(new Date(), 30);
      const recentSymptoms = relevantSymptoms.filter(symptom => {
        const symptomDate = parseISO(symptom.startTime);
        return isValid(symptomDate) && isAfter(symptomDate, thirtyDaysAgo);
      });

      data.recentSymptoms = recentSymptoms;

      // Finde verwandte Lebensmitteleinträge
      const relatedFoodEntries = foodEntries.filter(entry =>
        entry.profileIds.some(id => profileIds.includes(id)) &&
        entry.foodItems.toLowerCase().includes(allergen.toLowerCase())
      );

      data.relatedFoodEntries = relatedFoodEntries;

      // Berechne Schweregrad basierend auf Häufigkeit und Anzahl betroffener Profile
      if (data.totalOccurrences >= 3 || recentSymptoms.length > 5) {
        data.severity = 'high';
      } else if (data.totalOccurrences >= 2 || recentSymptoms.length > 2) {
        data.severity = 'medium';
      } else {
        data.severity = 'low';
      }

      // Berechne Trend (vereinfacht)
      if (recentSymptoms.length > 0) {
        const lastWeek = subDays(new Date(), 7);
        const lastWeekSymptoms = recentSymptoms.filter(s => {
          const date = parseISO(s.startTime);
          return isValid(date) && isAfter(date, lastWeek);
        });
        
        if (lastWeekSymptoms.length > recentSymptoms.length / 2) {
          data.trend = 'increasing';
        } else if (lastWeekSymptoms.length === 0) {
          data.trend = 'decreasing';
        }
      }

      // Letztes Symptom-Datum
      if (recentSymptoms.length > 0) {
        const sortedSymptoms = recentSymptoms.sort((a, b) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        data.lastSymptomDate = sortedSymptoms[0].startTime;
      }
    });

    return Array.from(allergensMap.values());
  }, [profiles, symptoms, foodEntries, selectedProfileId]);

  const filteredAndSortedAllergies = useMemo(() => {
    let filtered = allergyData.filter(allergy => 
      allergy.allergen.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterSeverity === 'all' || allergy.severity === filterSeverity)
    );

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'profiles':
          return b.affectedProfiles.length - a.affectedProfiles.length;
        case 'symptoms':
          return b.recentSymptoms.length - a.recentSymptoms.length;
        case 'recent':
          if (!a.lastSymptomDate && !b.lastSymptomDate) return 0;
          if (!a.lastSymptomDate) return 1;
          if (!b.lastSymptomDate) return -1;
          return new Date(b.lastSymptomDate).getTime() - new Date(a.lastSymptomDate).getTime();
        default:
          return a.allergen.localeCompare(b.allergen);
      }
    });
  }, [allergyData, searchTerm, sortBy, filterSeverity]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high': return 'Hoch';
      case 'medium': return 'Mittel';
      default: return 'Niedrig';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'decreasing': return <TrendingUp className="h-3 w-3 text-green-500 rotate-180" />;
      default: return <Activity className="h-3 w-3 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (selectedAllergen) {
    const allergenData = allergyData.find(a => a.allergen === selectedAllergen);
    if (allergenData) {
      return (
        <AllergyDetailCard
          allergyData={allergenData}
          onBack={() => setSelectedAllergen(null)}
          onEdit={() => {/* Implementierung folgt */}}
          onDelete={() => {/* Implementierung folgt */}}
        />
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Allergie-Übersicht</h2>
          <p className="text-gray-600">
            {filteredAndSortedAllergies.length} Allergene gefunden
          </p>
        </div>
        {showAddButton && (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Allergie hinzufügen
          </Button>
        )}
      </div>

      {/* Filter und Suche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Allergen suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="name">Nach Name</option>
          <option value="profiles">Nach Anzahl Profile</option>
          <option value="symptoms">Nach Symptomen</option>
          <option value="recent">Nach letztem Symptom</option>
        </select>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Alle Schweregrade</option>
          <option value="high">Hoch</option>
          <option value="medium">Mittel</option>
          <option value="low">Niedrig</option>
        </select>
      </div>

      {/* Allergie-Liste */}
      <div className="space-y-4">
        {filteredAndSortedAllergies.length > 0 ? (
          filteredAndSortedAllergies.map((allergy) => (
            <Card 
              key={allergy.allergen} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedAllergen(allergy.allergen);
                onAllergySelect?.(allergy.allergen);
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <div>
                      <CardTitle className="text-lg">{allergy.allergen}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {allergy.affectedProfiles.length} Profile
                        </span>
                        {allergy.lastSymptomDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(parseISO(allergy.lastSymptomDate), 'dd.MM.yyyy', { locale: de })}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getTrendIcon(allergy.trend)}
                    <Badge className={getSeverityColor(allergy.severity)}>
                      {getSeverityLabel(allergy.severity)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Betroffene Profile</p>
                    <p className="font-medium">{allergy.affectedProfiles.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Aktuelle Symptome (30d)</p>
                    <p className="font-medium">{allergy.recentSymptoms.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Verwandte Lebensmittel</p>
                    <p className="font-medium">{allergy.relatedFoodEntries.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Trend</p>
                    <p className="font-medium capitalize flex items-center gap-1">
                      {getTrendIcon(allergy.trend)}
                      {allergy.trend === 'increasing' ? 'Steigend' : 
                       allergy.trend === 'decreasing' ? 'Sinkend' : 'Stabil'}
                    </p>
                  </div>
                </div>

                {/* Betroffene Profile anzeigen */}
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Betroffene Profile:</p>
                  <div className="flex flex-wrap gap-2">
                    {allergy.affectedProfiles.slice(0, 3).map(profile => (
                      <Badge key={profile.id} variant="secondary" className="text-xs">
                        {profile.name}
                      </Badge>
                    ))}
                    {allergy.affectedProfiles.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{allergy.affectedProfiles.length - 3} weitere
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Keine Allergien gefunden
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? `Keine Allergien gefunden für "${searchTerm}"`
                  : 'Es sind noch keine Allergien registriert.'
                }
              </p>
              {showAddButton && (
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Erste Allergie hinzufügen
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
