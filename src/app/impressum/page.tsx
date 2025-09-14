import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';

export default function ImpressumPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Impressum" description="" />
      <Card className="shadow-lg">
        <CardContent className="space-y-1 text-foreground">
          <p>Jennifer Key</p>
          <p>Sieker Landstraße 41c</p>
          <p>22143 Hamburg</p>
          <p>Umsatzsteuer-Identifikationsnummer: 69 187 534 728</p>
        </CardContent>
      </Card>
    </div>
  );
}
