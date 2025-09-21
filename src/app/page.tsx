import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BarChart, Calendar, Shield, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '@/components/icons';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === "hero-1");

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
       <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Logo className="h-6 w-6" />
          <span className="sr-only">GDGoC VTU Portal</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Login
          </Link>
          <Link href="/events" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Events
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
           {heroImage && (
             <Image
                src={heroImage.imageUrl}
                fill
                alt="GDG Event"
                data-ai-hint={heroImage.imageHint}
                className="object-cover"
                priority
              />
           )}
          <div className="container px-4 md:px-6 grid place-items-center text-center relative z-20">
            <div className="grid gap-6 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none font-headline bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                    Welcome to the GDGoC VTU Portal
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto">
                    Your central hub for all events, house points, and community updates for GDGoC VTU 2025-26.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
                  <Button asChild size="lg">
                    <Link href="/login">Get Started</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/events">View Events</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">One Portal, Everything You Need</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our portal is designed to bring the entire GDGoC community together. Track your progress, stay updated on events, and connect with your house members.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-4 lg:max-w-none mt-12">
              <div className="grid gap-2 text-center p-6 rounded-lg hover:bg-card transition-colors">
                <div className="flex justify-center items-center mb-2">
                  <Calendar className="h-10 w-10 text-primary"/>
                </div>
                <h3 className="text-xl font-bold">Event Listings</h3>
                <p className="text-sm text-muted-foreground">Browse and get details on all upcoming workshops, talks, and competitions.</p>
              </div>
              <div className="grid gap-2 text-center p-6 rounded-lg hover:bg-card transition-colors">
                <div className="flex justify-center items-center mb-2">
                  <BarChart className="h-10 w-10 text-primary"/>
                </div>
                <h3 className="text-xl font-bold">Points Dashboard</h3>
                <p className="text-sm text-muted-foreground">Check your points, see your house's standing, and track your contributions.</p>
              </div>
              <div className="grid gap-2 text-center p-6 rounded-lg hover:bg-card transition-colors">
                <div className="flex justify-center items-center mb-2">
                  <Users className="h-10 w-10 text-primary"/>
                </div>
                <h3 className="text-xl font-bold">House Pages</h3>
                <p className="text-sm text-muted-foreground">Connect with your house, see member rankings, and build team spirit.</p>
              </div>
               <div className="grid gap-2 text-center p-6 rounded-lg hover:bg-card transition-colors">
                 <div className="flex justify-center items-center mb-2">
                  <Shield className="h-10 w-10 text-primary"/>
                </div>
                <h3 className="text-xl font-bold">Role-Based Access</h3>
                <p className="text-sm text-muted-foreground">Separate dashboards and controls for users and admins for a tailored experience.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex items-center justify-center w-full h-16 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 GDGoC VTU. All rights reserved.</p>
      </footer>
    </div>
  );
}
