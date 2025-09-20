import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { events } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Calendar, Clock, MapPin } from "lucide-react";
import Image from "next/image";

export default function EventsPage() {

    const allEvents = events.map(e => {
        const pImage = PlaceHolderImages.find(p => p.id === e.id);
        return {
            ...e,
            image: pImage?.imageUrl ?? 'https://picsum.photos/seed/event/600/400',
            imageHint: pImage?.imageHint ?? 'event',
        }
    })

  return (
    <>
      <PageHeader
        title="Events"
        description="Stay up-to-date with all our workshops, talks, and competitions."
      />
      <div className="grid gap-4 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {allEvents.map((event) => (
          <Card key={event.id} className="flex flex-col">
            <CardHeader className="p-0">
                <Image
                    src={event.image}
                    alt={event.title}
                    width={600}
                    height={400}
                    data-ai-hint={event.imageHint}
                    className="object-cover rounded-t-lg aspect-video"
                />
            </CardHeader>
            <div className="flex flex-col flex-grow p-6">
                <CardTitle className="mb-2 font-headline">{event.title}</CardTitle>
                <CardDescription className="flex-grow">{event.description}</CardDescription>
                <div className="flex items-center text-sm text-muted-foreground mt-4 gap-4">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>
            </div>
            <CardFooter className="p-6 pt-0">
              <Button className="w-full">Register</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
