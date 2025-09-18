"use client";

import { useRouter } from "next/navigation";
import { doSignInWithGoogle } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NeuroCalmIcon } from "@/components/icons";
import { useAuth } from "@/lib/firebase/auth-provider";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useToast } from "@/components/ui/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Only redirect if we're not in the middle of signing in
    if (user && !isSigningIn) {
      router.push("/dashboard");
    }
  }, [user, router, isSigningIn]);
  
  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;
    
    setIsSigningIn(true);
    try {
      const user = await doSignInWithGoogle();
      if (user) {
        const token = await user.getIdToken();
        Cookies.set('firebaseIdToken', token, { 
          expires: 1,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Sign-in failed", error);
      toast({
        title: "Sign-in failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSigningIn(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <NeuroCalmIcon className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to NeuroCalm</CardTitle>
          <CardDescription>Sign in to access your dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={handleGoogleSignIn}>
            Sign In with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
