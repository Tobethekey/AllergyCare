
import Link from 'next/link';
import {
  LayoutDashboard,
  Apple,
  ClipboardPlus,
  CalendarDays,
  FileText,
  User,
  HelpCircle, 
  PanelLeft,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarHeader,
} from '@/components/ui/sidebar';
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
  { href: '/food-log', icon: Apple, label: 'Essen Doku', tooltip: 'Nahrungsmittel dokumentieren' },
  { href: '/symptom-log', icon: ClipboardPlus, label: 'Symptom Doku', tooltip: 'Symptome erfassen' },
  { href: '/timeline', icon: CalendarDays, label: 'Zeitstrahl', tooltip: 'Zeitliche Übersicht' },
  { href: '/reports', icon: FileText, label: 'Berichte', tooltip: 'Berichte erstellen/exportieren' },
  { href: '/profile', icon: User, label: 'Profil', tooltip: 'Benutzerprofil' },
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
