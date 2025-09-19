"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NeuroCalmIcon } from "@/components/icons";
import { useToast } from "@/components/ui/use-toast";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      toast({
        title: "Email sent",
        description: "Check your inbox for a link to reset your password.",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      
      let errorMessage = "Failed to send reset email. Please try again.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Please try again later.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <NeuroCalmIcon className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            {emailSent ? "Check your email" : "Reset your password"}
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            {emailSent 
              ? `We've sent a password reset link to ${email}`
              : "Enter your email and we'll send you a link to reset your password."}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {emailSent ? (
            <div className="space-y-6 text-center">
              <div className="rounded-full bg-green-100 p-3 inline-flex items-center justify-center">
                <svg 
                  className="h-6 w-6 text-green-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
              
              <p className="text-sm text-gray-600">
                Didn't receive the email? Check your spam folder or 
                <button 
                  onClick={() => setEmailSent(false)}
                  className="ml-1 text-primary font-medium hover:underline"
                >
                  try again
                </button>.
              </p>
              
              <Button 
                onClick={() => router.push('/login')} 
                className="w-full mt-4"
              >
                Back to login
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="email">
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send reset link'}
                </Button>
              </form>
              
              <div className="mt-4 text-center text-sm">
                <Link 
                  href="/login" 
                  className="text-primary font-medium hover:underline"
                >
                  Back to login
                </Link>
              </div>
            </>
          )}
          
          <div className="mt-6 border-t border-gray-200 pt-4">
            <p className="text-xs text-center text-gray-500">
              Need help? Contact our support team at 
              <a 
                href="mailto:support@neurocalm.app" 
                className="text-primary hover:underline"
              >
                support@neurocalm.app
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
