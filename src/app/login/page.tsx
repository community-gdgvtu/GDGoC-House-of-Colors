"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";


export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleLogin = async (role: 'user' | 'admin') => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Redirect after successful login, handled by the AuthProvider
    } catch (error) {
      console.error("Error during sign-in:", error);
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
            <p className="text-muted-foreground">Select a role to continue</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
            <Card className="hover:bg-accent hover:text-accent-foreground transition-colors" onClick={() => handleLogin('user')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 cursor-pointer">
                <div>
                    <CardTitle>Login as User</CardTitle>
                    <CardDescription>Access your personal dashboard and events.</CardDescription>
                </div>
                <LogIn className="h-6 w-6 text-primary" />
              </CardHeader>
            </Card>
            <Card className="hover:bg-accent hover:text-accent-foreground transition-colors" onClick={() => handleLogin('admin')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 cursor-pointer">
                <div>
                    <CardTitle>Login as Admin</CardTitle>
                    <CardDescription>Manage users, events, and houses.</CardDescription>
                </div>
                <LogIn className="h-6 w-6 text-primary" />
              </CardHeader>
            </Card>
        </div>
        <div className="text-center text-sm">
          <Link href="/" className="underline text-muted-foreground">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
