

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
    { name: 'Home', href: '/', icon: <Home className="h-3 w-3 xs:h-4 xs:w-4" /> },
    { name: 'Dashboard', href: '/dashboard', icon: <BarChart2 className="h-3 w-3 xs:h-4 xs:w-4" /> },
    { name: 'Support', href: '/support', icon: <HelpCircle className="h-3 w-3 xs:h-4 xs:w-4" /> },
  ];

  if (loading) {
    return (
      <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-1">
        <nav className="flex flex-col xs:flex-row gap-1">
          {navItems.map((item) => (
            <Button 
              key={item.href} 
              variant="ghost" 
              size="sm" 
              className="w-full xs:w-auto justify-start h-8 xs:h-9 sm:h-10 px-2 xs:px-3" 
              disabled
            >
              <span className="flex items-center justify-center w-4 h-4 xs:w-5 xs:h-5">
                {item.icon}
              </span>
              <span className="ml-1.5 xs:ml-2 text-xs xs:text-sm sm:text-base truncate">{item.name}</span>
            </Button>
          ))}
        </nav>
        <div className="flex flex-col xs:flex-row gap-1 xs:gap-2 xs:ml-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 xs:h-9 sm:h-10 px-2 xs:px-3" 
            disabled
          >
            <span className="text-xs xs:text-sm sm:text-base">Loading...</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-1">
      <nav className="flex flex-col xs:flex-row gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          // Don't show dashboard link if not authenticated
          if (item.href === '/dashboard' && !isAuthenticated) return null;
          
          return (
            <Button
              key={item.href}
              asChild
              variant={isActive ? 'secondary' : 'ghost'}
              className="w-full xs:w-auto justify-start h-8 xs:h-9 sm:h-10 px-2 xs:px-3"
            >
              <Link href={item.href} className="flex items-center">
                <span className="flex items-center justify-center w-4 h-4 xs:w-5 xs:h-5">
                  {item.icon}
                </span>
                <span className="ml-1.5 xs:ml-2 text-xs xs:text-sm sm:text-base truncate">{item.name}</span>
              </Link>
            </Button>
          );
        })}
      </nav>

      <div className="flex flex-col xs:flex-row gap-1 xs:gap-2 xs:ml-auto">
        {isAuthenticated ? (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              asChild 
              className="h-8 xs:h-9 sm:h-10 px-2 xs:px-3"
            >
              <Link href="/profile" className="flex items-center">
                <span className="flex items-center justify-center w-4 h-4 xs:w-5 xs:h-5">
                  <User className="h-3 w-3 xs:h-4 xs:w-4" />
                </span>
                <span className="ml-1.5 xs:ml-2 text-xs xs:text-sm sm:text-base truncate">Profile</span>
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="h-8 xs:h-9 sm:h-10 px-2 xs:px-3 text-destructive hover:text-destructive flex items-center"
            >
              <span className="flex items-center justify-center w-4 h-4 xs:w-5 xs:h-5">
                <LogOut className="h-3 w-3 xs:h-4 xs:w-4" />
              </span>
              <span className="ml-1.5 xs:ml-2 text-xs xs:text-sm sm:text-base truncate">Sign Out</span>
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              asChild 
              className="h-8 xs:h-9 sm:h-10 px-2 xs:px-3"
            >
              <Link href="/login" className="text-xs xs:text-sm sm:text-base">Log In</Link>
            </Button>
            <Button 
              size="sm" 
              asChild 
              className="h-8 xs:h-9 sm:h-10 px-2 xs:px-3"
            >
              <Link href="/signup" className="text-xs xs:text-sm sm:text-base">Sign Up</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
