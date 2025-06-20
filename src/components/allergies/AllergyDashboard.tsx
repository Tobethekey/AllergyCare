'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Calendar, 
  Activity,
  Plus,
  Filter,
  BarChart3,
  Eye,
  FileText
} from 'lucide-react';
import { getUserProfiles, getSymptomEntries, getFoodEntries } from '@/lib/data-service';
import type { UserProfile, SymptomEntry, FoodEntry } from '@/lib/types';
import { ProfileDetailsCard } from '@/components/reports/ProfileDetailsCard';
import { format, parseISO, isValid, subDays, isAfter } from 'date-fns';
import { de } from 'date-fns/locale';

interface AllergyStats {
  totalProfiles: number;
  profilesWithAllergies: number;
  totalKnownAllergies: number;
  recentSymptoms: number;
  mostCommonAllergies: Array<{ allergen: string; count: number }>;
  recentTrends: {
    lastWeekSymptoms: number;
    previousWeekSymptoms: number;
    percentageChange: number;
  };
}

export function AllergyDashboard() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomEntry[]>([]);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [stats, setStats] = useState<AllergyStats | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (profiles.length > 0) {
      calculateStats();
    }
  }, [profiles, symptoms, foodEntries, selectedProfileId]);

  const loadData = () => {
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

  const calculateStats = () => {
    const filteredProfiles = selectedProfileId === 'all' 
      ? profiles 
      : profiles.filter(p => p.id === selectedProfileId);

    const filteredSymptoms = selectedProfileId === 'all' 
      ? symptoms 
      : symptoms.filter(s => s.profileId === selectedProfileId);

    const profilesWithAllergies = filteredProfiles.filter(p => 
      p.knownAllergies && p.knownAllergies.length > 0
    );

    const allAllergies = filteredProfiles
      .flatMap(p => p.knownAllergies || [])
      .filter(Boolean);

    const allergyCount = allAllergies.reduce((acc, allergen) => {
      acc[allergen] = (acc[allergen] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonAllergies = Object.entries(allergyCount)
      .map(([allergen, count]) => ({ allergen, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Berechne Trends der letzten 2 Wochen
    const now = new Date();
    const oneWeekAgo = subDays(now, 7);
    const twoWeeksAgo = subDays(now, 14);

    const lastWeekSymptoms = filteredSymptoms.filter(s => {
      const symptomDate = parseISO(s.startTime);
      return isValid(symptomDate) && isAfter(symptomDate, oneWeekAgo);
    }).length;

    const previousWeekSymptoms = filteredSymptoms.filter(s => {
      const symptomDate = parseISO(s.startTime);
      return isValid(symptomDate) && 
        isAfter(symptomDate, twoWeeksAgo) && 
        !isAfter(symptomDate, oneWeekAgo);
    }).length;

    const percentageChange = previousWeekSymptoms > 0 
      ? ((lastWeekSymptoms - previousWeekSymptoms) / previousWeekSymptoms) * 100
      : lastWeekSymptoms > 0 ? 100 : 0;

    // Symptome der letzten 7 Tage
    const recentSymptoms = lastWeekSymptoms;

    setStats({
      totalProfiles: filteredProfiles.length,
      profilesWithAllergies: profilesWithAllergies.length,
      totalKnownAllergies: allAllergies.length,
      recentSymptoms,
      mostCommonAllergies,
      recentTrends: {
        lastWeekSymptoms,
        previousWeekSymptoms,
        percentageChange
      }
    });
  };

  const filteredProfilesWithAllergies = selectedProfileId === 'all' 
    ? profiles.filter(p => p.knownAllergies && p.knownAllergies.length > 0)
    : profiles.filter(p => p.id === selectedProfileId && p.knownAllergies && p.knownAllergies.length > 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Allergie-Dashboard</h1>
          <p className="text-gray-600">Übersicht über Allergien und Symptome</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Bericht
          </Button>
        </div>
      </div>

      {/* Profil-Filter */}
      <div className="flex items-center gap-4">
        <label htmlFor="profile-filter" className="text-sm font-medium text-gray-700">
          Profil auswählen:
        </label>
        <select
          id="profile-filter"
          value={selectedProfileId}
          onChange={(e) => setSelectedProfileId(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Alle Profile</option>
          {profiles.map(profile => (
            <option key={profile.id} value={profile.id}>
              {profile.name}
            </option>
          ))}
        </select>
      </div>

      {/* Statistik-Karten */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProfiles}</div>
              <p className="text-xs text-muted-foreground">
                {stats.profilesWithAllergies} mit bekannten Allergien
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bekannte Allergien</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalKnownAllergies}</div>
              <p className="text-xs text-muted-foreground">
                Insgesamt registriert
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Symptome (7 Tage)</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentSymptoms}</div>
              <p className="text-xs text-muted-foreground">
                Aufgezeichnete Symptome
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trend</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.recentTrends.percentageChange > 0 ? '+' : ''}
                {stats.recentTrends.percentageChange.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                vs. vorherige Woche
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs für verschiedene Ansichten */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="allergies">Allergien</TabsTrigger>
          <TabsTrigger value="symptoms">Symptome</TabsTrigger>
          <TabsTrigger value="analysis">Analyse</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Häufigste Allergien */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Häufigste Allergien
                </CardTitle>
                <CardDescription>
                  Top 5 der am häufigsten registrierten Allergien
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.mostCommonAllergies.length ? (
                  <div className="space-y-3">
                    {stats.mostCommonAllergies.map((allergy, index) => (
                      <div key={allergy.allergen} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                            {index + 1}
                          </div>
                          <span className="font-medium">{allergy.allergen}</span>
                        </div>
                        <span className="text-sm text-gray-500">{allergy.count}x</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Keine Allergien registriert
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Aktuelle Warnungen/Hinweise */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Wichtige Hinweise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats && stats.recentSymptoms > stats.recentTrends.previousWeekSymptoms && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <strong>Erhöhte Symptomaktivität:</strong> Diese Woche wurden mehr Symptome aufgezeichnet als in der vorherigen Woche.
                      </p>
                    </div>
                  )}
                  
                  {filteredProfilesWithAllergies.length === 0 && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Profil vervollständigen:</strong> Fügen Sie bekannte Allergien zu Ihren Profilen hinzu, um bessere Analysen zu erhalten.
                      </p>
                    </div>
                  )}

                  {stats && stats.recentSymptoms === 0 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Keine Symptome:</strong> In den letzten 7 Tagen wurden keine Symptome aufgezeichnet.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="allergies" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Profile mit Allergien</h3>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Allergie hinzufügen
            </Button>
          </div>
          
          <div className="grid gap-4">
            {filteredProfilesWithAllergies.length > 0 ? (
              filteredProfilesWithAllergies.map(profile => (
                <ProfileDetailsCard 
                  key={profile.id} 
                  profile={profile} 
                  showTitle={true}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    {selectedProfileId === 'all' 
                      ? 'Keine Profile mit registrierten Allergien gefunden.'
                      : 'Dieses Profil hat keine registrierten Allergien.'
                    }
                  </p>
                  <Button className="mt-4" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Allergien hinzufügen
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="symptoms" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Aktuelle Symptome</h3>
            <Button size="sm">
              <Eye className="mr-2 h-4 w-4" />
              Alle anzeigen
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-500 text-center">
                Symptom-Übersicht wird hier angezeigt...
                <br />
                <span className="text-sm">(Wird in der nächsten Komponente implementiert)</span>
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Allergie-Analyse</h3>
            <Button size="sm">
              <BarChart3 className="mr-2 h-4 w-4" />
              Detailanalyse
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-500 text-center">
                Trigger-Analyse und Korrelationen werden hier angezeigt...
                <br />
                <span className="text-sm">(Wird in den folgenden Komponenten implementiert)</span>
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
