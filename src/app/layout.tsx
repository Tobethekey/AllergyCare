import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, Sidebar, SidebarInset, SidebarContent, SidebarFooter } from "@/components/ui/sidebar";
import NavItemsClient from '@/components/navigation/NavItemsClient'; // Client component to get pathname

export const metadata: Metadata = {
  title: 'AllergyLife',
  description: 'Einfache App zur Dokumentation von Nahrungsaufnahme und allergischen Reaktionen.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Belleza&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider defaultOpen={true}>
          <Sidebar collapsible="icon" className="shadow-lg">
            <SidebarContent>
              <NavItemsClient />
            </SidebarContent>
            <SidebarFooter className="p-2 text-xs text-sidebar-foreground/70">
              AllergyLife &copy; {new Date().getFullYear()}
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <main className="min-h-screen p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
