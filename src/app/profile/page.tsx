import PageHeader from '@/components/PageHeader';
import { UserProfileForm } from '@/components/profile/UserProfileForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Benutzerprofil"
        description="Verwalten Sie hier grundlegende Informationen und Notizen."
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-primary">Ihre Daten</CardTitle>
        </CardHeader>
        <CardContent>
          <UserProfileForm />
        </CardContent>
      </Card>
      <Card className="shadow-lg border-yellow-500/50 bg-yellow-500/5">
         <CardHeader>
            <CardTitle className="font-headline text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5"/> Datenschutzhinweis
            </CardTitle>
         </CardHeader>
         <CardContent className="text-yellow-700 dark:text-yellow-400">
            <p className="text-sm">
                Alle hier eingegebenen Daten werden ausschließlich lokal auf Ihrem Gerät gespeichert. 
                Es findet keine Übertragung an externe Server statt.
                Sie haben die volle Kontrolle über Ihre Informationen.
            </p>
         </CardContent>
      </Card>
    </div>
  );
}
