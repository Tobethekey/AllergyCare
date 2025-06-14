import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, HeartPulse, Activity } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Willkommen bei AllergyCare"
        description="Ihr Begleiter zur einfachen Dokumentation von Ernährung und Symptomen."
      >
        <div className="flex items-center gap-4">
          <GlobalSearch />
          <NotificationCenter />
        </div>
      </PageHeader>

      <QuickStats />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-primary">
                  <Utensils className="h-6 w-6" />
                  Essen dokumentieren
                </CardTitle>
                <CardDescription>
                  Erfassen Sie schnell und einfach Ihre Mahlzeiten.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/food-log" passHref>
                  <Button className="w-full" variant="default">
                    <Utensils className="mr-2 h-4 w-4" /> Mahlzeit hinzufügen
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-primary">
                  <HeartPulse className="h-6 w-6" />
                  Symptom erfassen
                </CardTitle>
                <CardDescription>
                  Notieren Sie auftretende Symptome und deren Details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/symptom-log" passHref>
                  <Button className="w-full" variant="default">
                    <HeartPulse className="mr-2 h-4 w-4" /> Symptom hinzufügen
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline text-primary">
                <Activity className="h-6 w-6" />
                Gesundheit im Blick
              </CardTitle>
              <CardDescription>
                Verfolgen Sie Zusammenhänge und erstellen Sie Berichte für Ihren Arzt.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Nutzen Sie den Zeitstrahl, um Muster zu erkennen, und die Berichtsfunktion, um Ihre Daten aufzubereiten.
              </p>
              <div className="flex gap-2">
                <Link href="/timeline" passHref>
                  <Button variant="outline" size="sm">
                    Zeitstrahl ansehen
                  </Button>
                </Link>
                <Link href="/reports" passHref>
                  <Button variant="outline" size="sm">
                    Berichte erstellen
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <RecentActivity />
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-primary">Über AllergyCare</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-foreground">
          <p>
            AllergyCare hilft Ihnen, potenzielle Nahrungsmittelunverträglichkeiten oder Allergieauslöser zu identifizieren, 
            indem Sie Ihre Ernährung und auftretende Symptome lückenlos dokumentieren.
          </p>
          <p>
            Alle Daten werden sicher und privat nur auf Ihrem Gerät gespeichert.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}