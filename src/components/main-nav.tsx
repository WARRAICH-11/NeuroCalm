'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-provider';
import { Button } from '@/components/ui/button';
import { LogOut, User, Home, BarChart2, HelpCircle, Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export function MainNav() {
  const { user, isAuthenticated, signOut, loading } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { name: 'Home', href: '/', icon: <Home className="h-4 w-4" /> },
    { name: 'Dashboard', href: '/dashboard', icon: <BarChart2 className="h-4 w-4" /> },
    { name: 'Support', href: '/support', icon: <HelpCircle className="h-4 w-4" /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-between">
        <nav className="hidden sm:flex gap-1">
          {navItems.map((item) => (
            <Button 
              key={item.href} 
              variant="ghost" 
              size="sm" 
              className="h-9 px-3" 
              disabled
            >
              {item.icon}
              <span className="ml-2">{item.name}</span>
            </Button>
          ))}
        </nav>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9 px-3" disabled>
            Loading...
          </Button>
        </div>
      </div>
    );
  }

  const filteredNavItems = navItems.filter(item => 
    item.href !== '/dashboard' || isAuthenticated
  );

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden sm:flex items-center justify-between w-full">
        <nav className="flex gap-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.href}
                asChild
                variant={isActive ? 'secondary' : 'ghost'}
                size="sm"
                className="h-9 px-3"
              >
                <Link href={item.href} className="flex items-center">
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="flex gap-2">
          {isAuthenticated ? (
            <>
              <Button variant="outline" size="sm" asChild className="h-9 px-3">
                <Link href="/profile" className="flex items-center">
                  <User className="h-4 w-4" />
                  <span className="ml-2">Profile</span>
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={signOut}
                className="h-9 px-3 text-destructive hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                <span className="ml-2">Sign Out</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild className="h-9 px-3">
                <Link href="/login">Log In</Link>
              </Button>
              <Button size="sm" asChild className="h-9 px-3">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden relative" ref={mobileMenuRef}>
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-10 w-10 p-0 touch-manipulation"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <div className="flex gap-1.5 xs:gap-2">
            {isAuthenticated ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={signOut}
                className="h-9 xs:h-10 px-2 xs:px-3 text-destructive hover:text-destructive touch-manipulation"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden xs:inline ml-2">Sign Out</span>
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild 
                  className="h-9 xs:h-10 px-2 xs:px-3 text-xs xs:text-sm touch-manipulation"
                >
                  <Link href="/login">
                    <span className="xs:hidden">In</span>
                    <span className="hidden xs:inline">Log In</span>
                  </Link>
                </Button>
                <Button 
                  size="sm" 
                  asChild 
                  className="h-9 xs:h-10 px-2 xs:px-3 text-xs xs:text-sm touch-manipulation"
                >
                  <Link href="/signup">
                    <span className="xs:hidden">Up</span>
                    <span className="hidden xs:inline">Sign Up</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown with Animation */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 mx-3 xs:mx-4 py-2 bg-card/95 backdrop-blur-sm border rounded-md shadow-lg z-50 animate-in slide-in-from-top-2 duration-200">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={isActive ? 'secondary' : 'ghost'}
                  className="w-full justify-start h-12 px-4 touch-manipulation"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href={item.href} className="flex items-center">
                    {item.icon}
                    <span className="ml-3 text-base">{item.name}</span>
                  </Link>
                </Button>
              );
            })}
            
            {isAuthenticated && (
              <Button
                variant="ghost"
                asChild
                className="w-full justify-start h-12 px-4 touch-manipulation"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href="/profile" className="flex items-center">
                  <User className="h-4 w-4" />
                  <span className="ml-3 text-base">Profile</span>
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}