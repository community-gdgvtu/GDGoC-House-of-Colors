"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { User } from "@/lib/data";
import {
  Home,
  Menu,
  Search,
  Shield,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons";
import { UserNav } from "@/components/user-nav";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import type { House } from "@/lib/data";


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [houses, setHouses] = useState<House[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "houses"), (snapshot) => {
      const housesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as House[];
      setHouses(housesData);
    });

    return () => unsub();
  }, []);

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/events", icon: Calendar, label: "Events" },
  ];

  if (loading || !user) {
     return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-4 rounded-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Logo className="h-6 w-6" />
              <span className="">GDGoC VTU Portal</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
               <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground">
                <Shield className="h-4 w-4" />
                Houses
              </div>
              <div className="ml-7">
                {houses.map(house => (
                    <Link key={house.id} href={`/house/${house.id}`} className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary text-xs">
                        {house.name}
                    </Link>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="#"
                  className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                  <Logo className="h-6 w-6" />
                  <span>GDGoC VTU</span>
                </Link>
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
                <div className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground">
                    <Shield className="h-5 w-5" />
                    Houses
                </div>
                <div className="ml-4">
                    {houses.map(house => (
                        <Link key={house.id} href={`/house/${house.id}`} className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground text-base">
                            {house.name}
                        </Link>
                    ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
             <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <ThemeToggle />
          <UserNav />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
