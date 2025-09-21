'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NeuroCalmIcon } from "@/components/icons";
import { useAuth } from "@/lib/firebase/auth-provider";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const googleProvider = new GoogleAuthProvider();

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Only redirect if we're not in the middle of signing in and user is authenticated
    if (user && !isSigningIn) {
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      // Use replace instead of push to prevent back button issues
      router.replace(redirectTo);
    }
  }, [user, isSigningIn, searchParams, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSigningIn) return;
    
    setIsSigningIn(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Force immediate redirect after successful sign-in
      if (userCredential.user) {
        const redirectTo = searchParams.get('redirect') || '/dashboard';
        // Force a page refresh to ensure all components update properly
        window.location.href = redirectTo;
      }
    } catch (error: any) {
      console.error("Sign-in failed", error);
      let errorMessage = 'Sign-in failed';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isSigningIn) return;
    
    setIsSigningIn(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      
      // Force immediate redirect after successful sign-in
      if (userCredential.user) {
        const redirectTo = searchParams.get('redirect') || '/dashboard';
        // Force a page refresh to ensure all components update properly
        window.location.href = redirectTo;
      }
    } catch (error) {
      console.error("Google sign-in failed", error);
      toast({
        title: 'Error',
        description: 'Google sign-in failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center">
            <NeuroCalmIcon className="h-12 w-12" />
          </div>
          <CardTitle className="text-center text-2xl font-bold tracking-tight">
            Sign in to your account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to sign in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full h-11"
            disabled={isSigningIn}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                placeholder="name@example.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSigningIn}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <label className="text-sm font-medium" htmlFor="password">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSigningIn}
                className="h-11"
              />
            </div>
            <Button className="w-full h-11" type="submit" disabled={isSigningIn}>
              {isSigningIn ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <div className="text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
