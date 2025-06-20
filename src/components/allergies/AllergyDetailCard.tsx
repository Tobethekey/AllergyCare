'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  AlertTriangle,
  Users,
  Activity,
  Calendar,
  TrendingUp,
  BarChart3,
  Edit,
  Trash2,
  ExternalLink,
  Clock,
  MapPin
} from 'lucide-react';
import type { UserProfile, SymptomEntry, FoodEntry } from '@/lib/types';
import { format, parseISO, isValid } from 'date-fns';
import { de } from 'date-fns/locale';

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

interface AllergyDetailCardProps {
  allergyData: AllergyData;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function AllergyDetailCard({ 
  allergyData, 
  onBack, 
  onEdit, 
  onDelete 
}: AllergyDetailCardProps) {
  const [activeTab, setActiveTab] = useState('overview');

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
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'Steigend';
      case 'decreasing': return 'Sinkend';
      default: return 'Stabil';
    }
  };

  const groupSymptomsByCategory = () => {
    const grouped = allergyData.recentSymptoms.reduce((acc, symptom) => {
      if (!acc[symptom.category]) {
        acc[symptom.category] = [];
      }
      acc[symptom.category].push(symptom);
      return acc;
    }, {} as Record<string, SymptomEntry[]>);

    return Object.entries(grouped).map(([category, symptoms]) => ({
      category,
      symptoms: symptoms.sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      ),
      count: symptoms.length
    }));
  };

  const getSymptomSeverityStats = () => {
    const severityCount = allergyData.recentSymptoms.reduce((acc, symptom) => {
      acc[symptom.severity] = (acc[symptom.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { severity: 'Leicht', count: severityCount['Leicht'] || 0, color: 'bg-green-500' },
      { severity: 'Mittel', count: severityCount['Mittel'] || 0, color: 'bg-yellow-500' },
      { severity: 'Schwer', count: severityCount['Schwer'] || 0, color: 'bg-red-500' }
    ];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{allergyData.allergen}</h1>
              <p className="text-gray-600">Allergie-Details und Verlauf</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={getSeverityColor(allergyData.severity)}>
            {getSeverityLabel(allergyData.severity)}
          </Badge>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Löschen
          </Button>
        </div>
      </div>

      {/* Statistik-Karten */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Betroffene Profile</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allergyData.affectedProfiles.length}</div>
            <p className="text-xs text-muted-foreground">
              von {allergyData.totalOccurrences} Einträgen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Symptome (30d)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allergyData.recentSymptoms.length}</div>
            <p className="text-xs text-muted-foreground">
              aufgezeichnete Symptome
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trend</CardTitle>
            {getTrendIcon(allergyData.trend)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTrendLabel(allergyData.trend)}</div>
            <p className="text-xs text-muted-foreground">
              letzte 30 Tage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Letztes Symptom</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allergyData.lastSymptomDate ? (
                format(parseISO(allergyData.lastSymptomDate), 'dd.MM', { locale: de })
              ) : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              {allergyData.lastSymptomDate ? (
                format(parseISO(allergyData.lastSymptomDate), 'yyyy', { locale: de })
              ) : 'Keine Symptome'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs für detaillierte Ansichten */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="symptoms">Symptome</TabsTrigger>
          <TabsTrigger value="profiles">Profile</TabsTrigger>
          <TabsTrigger value="food">Lebensmittel</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Symptom-Verteilung nach Kategorie */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Symptom-Kategorien
                </CardTitle>
              </CardHeader>
              <CardContent>
                {groupSymptomsByCategory().length > 0 ? (
                  <div className="space-y-3">
                    {groupSymptomsByCategory().map(({ category, count }) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Keine Symptome aufgezeichnet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Schweregrad-Verteilung */}
            <Card>
              <CardHeader>
                <CardTitle>Schweregrad-Verteilung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getSymptomSeverityStats().map(({ severity, count, color }) => (
                    <div key={severity} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${color}`}></div>
                        <span className="text-sm font-medium">{severity}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Wichtige Hinweise */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Wichtige Hinweise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allergyData.trend === 'increasing' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Zunehmende Symptome:</strong> Die Symptom-Häufigkeit für {allergyData.allergen} 
                      hat in letzter Zeit zugenommen. Erwägen Sie eine Konsultation mit einem Arzt.
                    </p>
                  </div>
                )}
                
                {allergyData.severity === 'high' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      <strong>Hoher Schweregrad:</strong> Diese Allergie zeigt einen hohen Schweregrad. 
                      Besondere Vorsicht bei der Exposition ist empfohlen.
                    </p>
                  </div>
                )}

                {allergyData.recentSymptoms.length === 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Keine aktuellen Symptome:</strong> In den letzten 30 Tagen wurden 
                      keine Symptome für {allergyData.allergen} aufgezeichnet.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="symptoms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aktuelle Symptome (letzte 30 Tage)</CardTitle>
              <CardDescription>
                Chronologische Auflistung aller aufgezeichneten Symptome
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allergyData.recentSymptoms.length > 0 ? (
                <div className="space-y-4">
                  {allergyData.recentSymptoms
                    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                    .map((symptom, index) => (
                    <div key={symptom.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{symptom.symptom}</h4>
                            <p className="text-sm text-gray-600">{symptom.category}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={
                              symptom.severity === 'Schwer' ? 'bg-red-100 text-red-800' :
                              symptom.severity === 'Mittel' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }>
                              {symptom.severity}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(parseISO(symptom.startTime), 'dd.MM.yyyy HH:mm', { locale: de })}
                          </span>
                          <span>Dauer: {symptom.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Keine Symptome in den letzten 30 Tagen aufgezeichnet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Betroffene Profile</CardTitle>
              <CardDescription>
                Profile, die diese Allergie registriert haben
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allergyData.affectedProfiles.map(profile => (
                  <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {profile.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">{profile.name}</h4>
                        <p className="text-sm text-gray-600">
                          {profile.knownAllergies?.length || 0} bekannte Allergien
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="food" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verwandte Lebensmitteleinträge</CardTitle>
              <CardDescription>
                Lebensmittel, die möglicherweise mit {allergyData.allergen} in Verbindung stehen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allergyData.relatedFoodEntries.length > 0 ? (
                <div className="space-y-4">
                  {allergyData.relatedFoodEntries
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 10)
                    .map(entry => (
                    <div key={entry.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{entry.foodItems}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {format(parseISO(entry.timestamp), 'dd.MM.yyyy HH:mm', { locale: de })}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Keine verwandten Lebensmitteleinträge gefunden
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
