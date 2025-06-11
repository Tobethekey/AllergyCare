import PageHeader from '@/components/PageHeader';
import { SymptomLogForm } from '@/components/forms/SymptomLogForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SymptomLogPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Symptome erfassen"
        description="Dokumentieren Sie hier aufgetretene gesundheitliche Beschwerden."
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-primary">Neues Symptom hinzufügen</CardTitle>
        </CardHeader>
        <CardContent>
          <SymptomLogForm />
        </CardContent>
      </Card>
    </div>
  );
}
