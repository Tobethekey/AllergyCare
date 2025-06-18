import Link from 'next/link';
import {
  LayoutDashboard,
  Users, // Added for Profiles
  BookCopy,
  ListPlus,
  History,
  DownloadCloud,
  HelpCircle, 
  Settings,
  PanelLeft,
} from 'lucide-react';
import AppLogo from '@/components/AppLogo';
import type React from 'react';

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  tooltip: string;
}

const navItems: NavItem[] = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard', tooltip: 'Dashboard' },
  { href: '/profiles', icon: Users, label: 'Profile', tooltip: 'Profile verwalten' },
  { href: '/food-log', icon: BookCopy, label: 'Mahlzeiten-Doku', tooltip: 'Mahlzeiten dokumentieren' },
  { href: '/symptom-log', icon: ListPlus, label: 'Symptom-Doku', tooltip: 'Symptome erfassen' },
  { href: '/timeline', icon: History, label: 'Historie', tooltip: 'Zeitliche Übersicht' },
  { href: '/reports', icon: DownloadCloud, label: 'Download', tooltip: 'Berichte herunterladen/exportieren' },
  { href: '/settings', icon: Settings, label: 'Einstellungen', tooltip: 'App-Einstellungen' },
  { href: '/help', icon: HelpCircle, label: 'Hilfe', tooltip: 'Hilfe & Informationen'},
];

interface NavItemsProps {
  pathname: string;
}

const NavItems: React.FC<NavItemsProps> = ({ pathname }) => {
  return (
    <>
      <SidebarHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AppLogo />
          <span className="font-headline text-lg font-semibold text-sidebar-primary group-data-[collapsible=icon]:hidden">
            AllergyCare
          </span>
        </div>
        <SidebarTrigger className="md:hidden">
           <PanelLeft />
        </SidebarTrigger>
      </SidebarHeader>
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href}>
              <SidebarMenuButton
                isActive={pathname === item.href}
                tooltip={item.tooltip}
                aria-label={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </>
  );
};

export default NavItems;
