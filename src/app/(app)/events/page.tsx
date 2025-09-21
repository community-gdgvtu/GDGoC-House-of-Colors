
"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { events } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Calendar, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function EventsPage() {
  const { toast } = useToast();
  const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(new Set());

  const allEvents = events.map(e => {
    const pImage = PlaceHolderImages.find(p => p.id === e.id);
    return {
      ...e,
      image: pImage?.imageUrl ?? 'https://picsum.photos/seed/event/600/400',
      imageHint: pImage?.imageHint ?? 'event',
    }
  });

  const handleRegister = (eventId: string, eventName: string) => {
    setRegisteredEvents(prev => new Set(prev).add(eventId));
    toast({
      title: "Registration Successful!",
      description: `You have successfully registered for ${eventName}.`,
    });
  };

  return (
    <>
      <PageHeader
        title="Events"
        description="Stay up-to-date with all our workshops, talks, and competitions."
      />
      <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {allEvents.map((event) => {
          const isRegistered = registeredEvents.has(event.id);
          return (
            <Card key={event.id} className="flex flex-col bg-card/50 hover:bg-card/75 transition-colors duration-300 overflow-hidden group">
              <CardHeader className="p-0 relative">
                  <Image
                      src={event.image}
                      alt={event.title}
                      width={600}
                      height={400}
                      data-ai-hint={event.imageHint}
                      className="object-cover aspect-video group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6">
                     <CardTitle className="text-white font-headline text-2xl">{event.title}</CardTitle>
                  </div>
              </CardHeader>
              <div className="flex flex-col flex-grow p-6">
                  <CardDescription className="flex-grow text-muted-foreground">{event.description}</CardDescription>
                  <div className="flex items-center text-sm text-muted-foreground mt-4 gap-4">
                      <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                  </div>
              </div>
              <CardFooter className="p-6 pt-0">
                <Button 
                  className="w-full" 
                  onClick={() => handleRegister(event.id, event.title)}
                  disabled={isRegistered}
                >
                  {isRegistered ? <><CheckCircle className="mr-2 h-4 w-4" /> Registered</> : 'Register Now'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </>
  );
}
