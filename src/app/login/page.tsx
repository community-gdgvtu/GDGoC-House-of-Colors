
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

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Error during sign-in:", error);
      toast({
        title: "Sign-in Failed",
        description: error.message,
        variant: "destructive"
      });
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
    if (!loading && user) {
        if (user.role === 'admin') {
            router.push('/admin');
        } else {
            router.push('/dashboard');
        }
    }
  }, [user, loading, router]);


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
                <Button onClick={handleSignIn} className="w-full">
                    <LogIn className="mr-2 h-4 w-4" /> Sign In
                </Button>
            </CardContent>
        </Card>
        <div className="text-center text-sm">
          <p className="text-xs text-muted-foreground">If you don't have an account, please contact an admin.</p>
          <Link href="/" className="underline text-muted-foreground mt-2 inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
