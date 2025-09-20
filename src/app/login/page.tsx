
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
  createUserWithEmailAndPassword 
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
      // Redirect after successful login is handled by the AuthProvider
    } catch (error: any) {
      console.error("Error during sign-in:", error);
      toast({
        title: "Sign-in Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Redirect after successful sign-up is handled by the AuthProvider
    } catch (error: any) {
      console.error("Error during sign-up:", error);
       toast({
        title: "Sign-up Failed",
        description: error.message,
        variant: "destructive"
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
            <p className="text-muted-foreground">Sign in or create an account to continue</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Enter your credentials to access your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSignIn} className="w-full">
                      <LogIn className="mr-2 h-4 w-4" /> Sign In
                  </Button>
                  <Button onClick={handleSignUp} variant="secondary" className="w-full">
                      Sign Up
                  </Button>
                </div>
            </CardContent>
        </Card>
        <div className="text-center text-sm">
          <Link href="/" className="underline text-muted-foreground">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

