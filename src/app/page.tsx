import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, HeartPulse, Activity } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Willkommen bei AllergyLife"
        description="Ihr Begleiter zur einfachen Dokumentation von Ernährung und Symptomen."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-2 lg:col-span-1">
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
             <p className="text-sm text-muted-foreground">
              Nutzen Sie den Zeitstrahl, um Muster zu erkennen, und die Berichtsfunktion, um Ihre Daten aufzubereiten.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-primary">Über AllergyLife</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-foreground">
          <p>
            AllergyLife hilft Ihnen, potenzielle Nahrungsmittelunverträglichkeiten oder Allergieauslöser zu identifizieren, 
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
