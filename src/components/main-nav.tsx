

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-provider';
import { Button } from '@/components/ui/button';
import { LogOut, User, Home, BarChart2, HelpCircle } from 'lucide-react';

export function MainNav() {
  const { user, isAuthenticated, signOut, loading } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/', icon: <Home className="h-4 w-4" /> },
    { name: 'Dashboard', href: '/dashboard', icon: <BarChart2 className="h-4 w-4" /> },
    { name: 'Support', href: '/support', icon: <HelpCircle className="h-4 w-4" /> },
  ];

  if (loading) {
    return (
      <nav className="flex items-center space-x-1">
        {navItems.map((item) => (
          <Button key={item.href} variant="ghost" size="sm" className="w-full justify-start" disabled>
            {item.icon}
            <span className="ml-2">{item.name}</span>
          </Button>
        ))}
      </nav>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-1 space-y-2 sm:space-y-0">
      <nav className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          // Don't show dashboard link if not authenticated
          if (item.href === '/dashboard' && !isAuthenticated) return null;
          
          return (
            <Button
              key={item.href}
              asChild
              variant={isActive ? 'secondary' : 'ghost'}
              className="w-full sm:w-auto justify-start h-10"
            >
              <Link href={item.href}>
                {item.icon}
                <span className="ml-2 text-sm sm:text-base">{item.name}</span>
              </Link>
            </Button>
          );
        })}
      </nav>

      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 sm:ml-auto">
        {isAuthenticated ? (
          <>
            <Button variant="outline" size="sm" asChild className="h-10">
              <Link href="/profile" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span className="text-sm sm:text-base">Profile</span>
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="text-destructive hover:text-destructive h-10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="text-sm sm:text-base">Sign Out</span>
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" asChild className="h-10">
              <Link href="/login" className="text-sm sm:text-base">Log In</Link>
            </Button>
            <Button size="sm" asChild className="h-10">
              <Link href="/signup" className="text-sm sm:text-base">Sign Up</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
