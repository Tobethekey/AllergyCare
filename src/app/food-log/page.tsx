import PageHeader from '@/components/PageHeader';
import { FoodLogForm } from '@/components/forms/FoodLogForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FoodLogPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nahrungsmittel dokumentieren"
        description="Erfassen Sie hier Ihre Mahlzeiten und Getränke."
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-primary">Neue Mahlzeit hinzufügen</CardTitle>
        </CardHeader>
        <CardContent>
          <FoodLogForm />
        </CardContent>
      </Card>
    </div>
  );
}
