'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LifeBuoy, LogOut, User, Home } from "lucide-react";
import { NeuroCalmIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/firebase/auth-provider";
import { ProtectedRoute } from "@/components/auth/protected-route";

type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  
  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { name: 'Profile', href: '/profile', icon: <User className="h-4 w-4" /> },
    { name: 'Support', href: '/support', icon: <LifeBuoy className="h-4 w-4" /> },
  ];
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen w-full bg-muted/40">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r bg-background">
          <div className="flex h-16 items-center border-b px-6">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold"
            >
              <NeuroCalmIcon className="h-6 w-6" />
              <span>NeuroCalm</span>
            </Link>
          </div>
          <nav className="flex-1 overflow-auto py-4">
            <div className="px-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-2',
                      isActive && 'bg-accent text-accent-foreground'
                    )}
                    asChild
                  >
                    <Link href={item.href}>
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </nav>
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </aside>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50">
          <div className="flex justify-around py-1 xs:py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn(
                    'flex flex-col items-center gap-0.5 xs:gap-1 h-auto py-1.5 xs:py-2 px-2 xs:px-3',
                    isActive && 'bg-accent text-accent-foreground'
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <div className="h-3 w-3 xs:h-4 xs:w-4">{item.icon}</div>
                    <span className="text-[10px] xs:text-xs leading-tight">{item.name}</span>
                  </Link>
                </Button>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center gap-0.5 xs:gap-1 h-auto py-1.5 xs:py-2 px-2 xs:px-3 text-destructive hover:text-destructive"
              onClick={signOut}
            >
              <LogOut className="h-3 w-3 xs:h-4 xs:w-4" />
              <span className="text-[10px] xs:text-xs leading-tight">Sign Out</span>
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0 pb-16 lg:pb-0">
          {/* Mobile Header */}
          <header className="flex h-14 xs:h-16 items-center gap-2 xs:gap-4 border-b bg-background px-3 xs:px-4 lg:px-6">
            <div className="lg:hidden">
              <Link
                href="/"
                className="flex items-center gap-1 xs:gap-2 font-semibold"
              >
                <NeuroCalmIcon className="h-5 w-5 xs:h-6 xs:w-6" />
                <span className="text-base xs:text-lg">NeuroCalm</span>
              </Link>
            </div>
            <h1 className="text-base xs:text-lg font-semibold lg:block hidden">
              {navItems.find(item => pathname === item.href)?.name || 'Dashboard'}
            </h1>
            <div className="ml-auto flex items-center gap-1 xs:gap-2 lg:gap-4">
              <Button variant="outline" size="sm" asChild className="hidden xs:flex">
                <Link href="/">
                  <Home className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
                  <span className="hidden sm:inline">Back to Home</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="xs:hidden">
                <Link href="/">
                  <Home className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-3 xs:p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}