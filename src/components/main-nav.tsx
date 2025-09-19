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
    <div className="flex flex-col md:flex-row md:items-center md:space-x-1 space-y-2 md:space-y-0">
      <nav className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          // Don't show dashboard link if not authenticated
          if (item.href === '/dashboard' && !isAuthenticated) return null;
          
          return (
            <Button
              key={item.href}
              asChild
              variant={isActive ? 'secondary' : 'ghost'}
              className="w-full md:w-auto justify-start"
            >
              <Link href={item.href}>
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </Link>
            </Button>
          );
        })}
      </nav>

      <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2 md:ml-auto">
        {isAuthenticated ? (
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/profile" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
