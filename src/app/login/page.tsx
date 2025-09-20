import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
            <Logo className="h-12 w-12" />
            <h1 className="text-3xl font-bold font-headline">GDGoC VTU Portal</h1>
            <p className="text-muted-foreground">Select a role to continue</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <Link href="/dashboard">
            <Card className="hover:bg-accent hover:text-accent-foreground transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                    <CardTitle>Login as User</CardTitle>
                    <CardDescription>Access your personal dashboard and events.</CardDescription>
                </div>
                <LogIn className="h-6 w-6 text-primary" />
              </CardHeader>
            </Card>
          </Link>
          <Link href="/admin">
            <Card className="hover:bg-accent hover:text-accent-foreground transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                    <CardTitle>Login as Admin</CardTitle>
                    <CardDescription>Manage users, events, and houses.</CardDescription>
                </div>
                <LogIn className="h-6 w-6 text-primary" />
              </CardHeader>
            </Card>
          </Link>
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
