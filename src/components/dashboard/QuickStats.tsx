'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFoodEntries, getSymptomEntries, getUserProfiles } from '@/lib/data-service';
import { Apple, HeartPulse, Users, TrendingUp } from 'lucide-react';

interface Stats {
  totalMeals: number;
  totalSymptoms: number;
  totalProfiles: number;
  recentActivity: number;
}

export function QuickStats() {
  const [stats, setStats] = useState<Stats>({
    totalMeals: 0,
    totalSymptoms: 0,
    totalProfiles: 0,
    recentActivity: 0
  });

  useEffect(() => {
    const foodEntries = getFoodEntries();
    const symptomEntries = getSymptomEntries();
    const profiles = getUserProfiles();
    
    // Calculate recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentMeals = foodEntries.filter(entry => 
      new Date(entry.timestamp) >= sevenDaysAgo
    ).length;
    
    const recentSymptoms = symptomEntries.filter(entry => 
      new Date(entry.startTime) >= sevenDaysAgo
    ).length;

    setStats({
      totalMeals: foodEntries.length,
      totalSymptoms: symptomEntries.length,
      totalProfiles: profiles.length,
      recentActivity: recentMeals + recentSymptoms
    });
  }, []);

  const statCards = [
    {
      title: 'Mahlzeiten',
      value: stats.totalMeals,
      icon: Apple,
      color: 'text-green-600'
    },
    {
      title: 'Symptome',
      value: stats.totalSymptoms,
      icon: HeartPulse,
      color: 'text-red-600'
    },
    {
      title: 'Profile',
      value: stats.totalProfiles,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Letzte 7 Tage',
      value: stats.recentActivity,
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}