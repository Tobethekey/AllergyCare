'use client';

import PageHeader from '@/components/PageHeader';
import { SymptomLogForm } from '@/components/forms/SymptomLogForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function SymptomLogPage() {
  const handleFormSubmitted = () => {
    // This function is called when the SymptomLogForm is successfully submitted.
    // The form already resets itself and shows a toast.
    // If there were a list of entries on this page, we might refresh it here.
    // For now, a console log or no-op is sufficient.
    // console.log('SymptomLogForm submitted and handled by SymptomLogPage.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Symptome erfassen"
        description="Dokumentieren Sie hier aufgetretene gesundheitliche Beschwerden und deren Details."
      />
      
      {/* Hinweis-Card für bessere Dokumentation */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-orange-900">Tipp für bessere Analyse</p>
              <p className="text-orange-700 mt-1">
                Je genauer Sie Symptome dokumentieren, desto besser können wir Zusammenhänge 
                zu Ihrer Ernährung erkennen. Notieren Sie auch Zeitpunkt und Schweregrad.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-primary">Neues Symptom hinzufügen</CardTitle>
        </CardHeader>
        <CardContent>
          <SymptomLogForm onFormSubmit={handleFormSubmitted} />
        </CardContent>
      </Card>
    </div>
  );
}
