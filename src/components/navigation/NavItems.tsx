// src/components/navigation/NavItems.tsx

'use client'; // Wichtig: 'use client' hinzufügen, da wir einen Hook (usePathname) verwenden

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ClipboardList,
  Stethoscope,
  BarChart3,
  GitCompareArrows,
  Users,
  Settings,
  HelpCircle,
} from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/food-log', label: 'Essens-Log', icon: ClipboardList },
  { href: '/symptom-log', label: 'Symptom-Log', icon: Stethoscope },
  { href: '/timeline', label: 'Zeitstrahl & Analyse', icon: GitCompareArrows },
  { href: '/reports', label: 'Berichte', icon: BarChart3 },
  { href: '/profiles', label: 'Profile', icon: Users },
  { href: '/settings', label: 'Einstellungen', icon: Settings },
  { href: '/help', label: 'Hilfe', icon: HelpCircle },
];

export function NavItems() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-2">
      {navLinks.map((link) => {
        const isActive =
          link.href === '/'
            ? pathname === '/'
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
