import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BarChart, Calendar, Shield, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === "hero-1");

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Welcome to the GDGoC VTU Portal
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Your central hub for all events, house points, and community updates for GDGoC VTU 2025-26.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/login">Get Started</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/events">View Events</Link>
                  </Button>
                </div>
              </div>
               {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  width={600}
                  height={400}
                  alt="GDG Event"
                  data-ai-hint={heroImage.imageHint}
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                />
              )}
            </div>
          </div>
        </section>
        
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-card">
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
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              <div className="grid gap-1 text-center">
                <div className="flex justify-center items-center">
                  <Calendar className="h-10 w-10 text-primary"/>
                </div>
                <h3 className="text-lg font-bold">Event Listings</h3>
                <p className="text-sm text-muted-foreground">Browse and get details on all upcoming workshops, talks, and competitions.</p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="flex justify-center items-center">
                  <BarChart className="h-10 w-10 text-primary"/>
                </div>
                <h3 className="text-lg font-bold">Points Dashboard</h3>
                <p className="text-sm text-muted-foreground">Check your points, see your house's standing, and track your contributions.</p>
              </div>
              <div className="grid gap-1 text-center">
                <div className="flex justify-center items-center">
                  <Users className="h-10 w-10 text-primary"/>
                </div>
                <h3 className="text-lg font-bold">House Pages</h3>
                <p className="text-sm text-muted-foreground">Connect with your house, see member rankings, and build team spirit.</p>
              </div>
              <div className="grid gap-1 text-center lg:col-start-2">
                 <div className="flex justify-center items-center">
                  <Shield className="h-10 w-10 text-primary"/>
                </div>
                <h3 className="text-lg font-bold">Role-Based Access</h3>
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
