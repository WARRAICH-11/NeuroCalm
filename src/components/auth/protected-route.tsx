'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, loading, checkAuth } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const isValid = await checkAuth();
        
        if (!isValid) {
          // Not authenticated, redirect to login
          router.replace(redirectTo);
          return;
        }

        if (requiredRole) {
          // Check user role if required
          const tokenResult = await user?.getIdTokenResult();
          const hasRole = tokenResult?.claims.role === requiredRole;
          
          if (!hasRole) {
            // User doesn't have required role, redirect to home or unauthorized page
            router.replace('/unauthorized');
            return;
          }
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth verification failed:', error);
        router.replace(redirectTo);
      }
    };

    verifyAuth();
  }, [checkAuth, isAuthenticated, requiredRole, router, user, redirectTo]);

  if (loading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 ml-4">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
