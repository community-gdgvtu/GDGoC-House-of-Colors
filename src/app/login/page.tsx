
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons";
import { auth } from "@/lib/firebase";
import { 
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";


export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The useEffect will handle redirection
    } catch (error: any) {
      console.error("Error during sign-in:", error);
      toast({
        title: "Sign-in Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
        setIsSigningIn(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to reset your password.",
        variant: "destructive",
      });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your inbox for a link to reset your password.",
      });
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      toast({
        title: "Password Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isClient && !loading && user) {
        if (user.role === 'organizer') {
            router.push('/admin');
        } else {
            router.push('/dashboard');
        }
    }
  }, [user, loading, router, isClient]);

  if (loading || !isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div>Loading...</div>
      </div>
    );
  }

  if (user) {
    // Render nothing while redirecting
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
            <Logo className="h-12 w-12" />
            <h1 className="text-3xl font-bold font-headline">GDGoC VTU Portal</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Welcome</CardTitle>
                <CardDescription>Enter your credentials to access your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <button onClick={handlePasswordReset} className="ml-auto inline-block text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline">
                        Forgot your password?
                      </button>
                    </div>
                    <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <Button onClick={handleSignIn} disabled={isSigningIn} className="w-full">
                    <LogIn className="mr-2 h-4 w-4" /> 
                    {isSigningIn ? 'Signing In...' : 'Sign In'}
                </Button>
                 <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="underline">
                    Register
                  </Link>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
