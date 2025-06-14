import PageHeader from '@/components/PageHeader';
import { DataBackup } from '@/components/data/DataBackup';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Einstellungen"
        description="Verwalten Sie Ihre App-Einstellungen und Datensicherung."
      />
      <DataBackup />
    </div>
  );
}