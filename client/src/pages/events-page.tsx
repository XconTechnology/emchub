import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Search, 
  MapPin,
  Clock,
  Users,
  DollarSign,
  Globe,
  Home
} from "lucide-react";
import { format } from "date-fns";
import type { Listing } from "@shared/schema";

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: events, isLoading } = useQuery<Listing[]>({
    queryKey: ['/api/listings'],
    select: (data) => data.filter(item => item.type === 'event' && item.status === 'published'),
  });

  // Filter events based on search
  const filteredEvents = events?.filter(event => {
    const searchLower = searchQuery.toLowerCase();
    return (
      event.title?.toLowerCase().includes(searchLower) ||
      event.description?.toLowerCase().includes(searchLower) ||
      event.address?.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Sort events by date (upcoming first)
  const sortedEvents = filteredEvents.sort((a, b) => {
    if (!a.eventDate || !b.eventDate) return 0;
    return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
  });

  const getLocationDisplay = (event: Listing) => {
    if (event.isOnlineOnly) {
      return { icon: Globe, text: "Online Event" };
    } else if (event.address) {
      return { icon: MapPin, text: event.address };
    }
    return { icon: MapPin, text: "Location TBA" };
  };

  const getPriceDisplay = (event: Listing) => {
    if (!event.eventPrice || parseFloat(event.eventPrice.toString()) === 0) {
      return "Free";
    }
    return `HK$${parseFloat(event.eventPrice.toString()).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header forceSolid />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
              Events
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and join events from our community
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search events by name, description, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-events"
            />
          </div>
        </div>

        {/* Events Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400" data-testid="text-events-count">
            {sortedEvents.length} event{sortedEvents.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
                <CardHeader>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white" data-testid="text-no-events">
              {events?.length === 0 ? "No events available yet" : "No events match your search"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {events?.length === 0
                ? "Check back soon for upcoming events from our community."
                : "Try adjusting your search criteria."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map((event) => {
              const location = getLocationDisplay(event);
              const LocationIcon = location.icon;
              
              return (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-event-${event.id}`}>
                  {/* Event Image */}
                  {event.images && event.images.length > 0 ? (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={event.images[0]} 
                        alt={event.title || 'Event'} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Calendar className="w-16 h-16 text-primary/40" />
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-lg line-clamp-2 flex-1" data-testid={`text-event-title-${event.id}`}>
                        {event.title}
                      </h3>
                      <Badge variant="secondary" className="shrink-0">
                        {getPriceDisplay(event)}
                      </Badge>
                    </div>

                    {event.eventDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
                        <Clock className="w-4 h-4" />
                        <span data-testid={`text-event-date-${event.id}`}>
                          {format(new Date(event.eventDate), "MMM dd, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                      {event.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <LocationIcon className="w-4 h-4 shrink-0" />
                        <span className="line-clamp-1">{location.text}</span>
                      </div>

                      {event.capacity && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Users className="w-4 h-4 shrink-0" />
                          <span>Max {event.capacity} attendees</span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Link href={`/event/${event.id}`} className="w-full">
                      <Button className="w-full" data-testid={`button-view-event-${event.id}`}>
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
