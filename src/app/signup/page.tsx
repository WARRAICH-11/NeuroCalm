"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NeuroCalmIcon } from "@/components/icons";
import { useAuth } from "@/lib/firebase/auth-provider";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const googleProvider = new GoogleAuthProvider();

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Only redirect if we're not in the middle of signing up
    if (user && !isSigningUp) {
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      router.push(redirectTo);
    }
  }, [user, router, isSigningUp, searchParams]);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }
    
    setIsSigningUp(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Force immediate redirect after successful sign-up
      if (userCredential.user) {
        const redirectTo = searchParams.get('redirect') || '/dashboard';
        // Force a page refresh to ensure all components update properly
        window.location.href = redirectTo;
      }
    } catch (error: any) {
      console.error("Sign-up failed", error);
      let errorMessage = 'Sign-up failed';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account already exists with this email';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Please choose a stronger password';
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSigningUp(false);
    }
  };
  
  const handleGoogleSignUp = async () => {
    if (isSigningUp) return;
    
    setIsSigningUp(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      // Force immediate redirect after successful sign-up
      if (userCredential.user) {
        const redirectTo = searchParams.get('redirect') || '/dashboard';
        // Force a page refresh to ensure all components update properly
        window.location.href = redirectTo;
      }
    } catch (error: any) {
      console.error("Google sign-up failed", error);
      
      let errorMessage = 'Google sign-up failed';
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with the same email but different sign-in credentials';
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-gray-200 animate-pulse mb-4"></div>
            <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-md mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 animate-pulse rounded-md"></div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-200 animate-pulse rounded-md"></div>
              <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded-md"></div>
              <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 animate-pulse rounded-md"></div>
              <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
            </div>
            <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
            <div className="h-4 w-full text-center bg-gray-200 animate-pulse rounded-md"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <NeuroCalmIcon className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            Create an account
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            Join NeuroCalm and start your journey to better mental health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-11"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full h-11"
              />
              <p className="text-xs text-gray-500">Must be at least 6 characters</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full h-11"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-11" 
              disabled={isSigningUp}
            >
              {isSigningUp ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button
              onClick={handleGoogleSignUp}
              disabled={isSigningUp}
              className="w-full h-11 flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              variant="outline"
              type="button"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
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
              Continue with Google
            </Button>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              href={`/login${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`} 
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </div>
          
          <div className="mt-4 text-center text-xs text-gray-500">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and{' '}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
