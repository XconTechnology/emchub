import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MapPin,
  Clock,
  Users,
  DollarSign,
  Globe,
  ArrowLeft,
  Coins
} from "lucide-react";
import { format } from "date-fns";
import type { Listing } from "@shared/schema";

export default function EventDetailPage() {
  const [, params] = useRoute("/event/:id");
  const eventId = params?.id;

  const { data: events, isLoading } = useQuery<Listing[]>({
    queryKey: ['/api/listings'],
  });

  const event = events?.find(e => e.id === eventId && e.type === 'event');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header forceSolid />
        <div className="container mx-auto px-4 py-24">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header forceSolid />
        <div className="container mx-auto px-4 py-24 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Event Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/events">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getPriceDisplay = () => {
    if (!event.eventPrice || parseFloat(event.eventPrice.toString()) === 0) {
      return { amount: "Free", type: null };
    }
    const price = parseFloat(event.eventPrice.toString());
    
    if (event.paymentType === "cash_only") {
      return { amount: `HK$${price.toFixed(2)}`, type: "Cash Only" };
    } else if (event.paymentType === "timedollar_only") {
      return { amount: `${price.toFixed(0)} TD`, type: "TimeDollar Only" };
    } else if (event.paymentType === "both") {
      return { amount: `HK$${price.toFixed(2)} or ${price.toFixed(0)} TD`, type: "Cash or TimeDollar" };
    } else if (event.paymentType === "combo_split" && event.timedollarPercentage) {
      const tdAmount = (price * event.timedollarPercentage / 100).toFixed(0);
      const cashAmount = (price * (100 - event.timedollarPercentage) / 100).toFixed(2);
      return { amount: `HK$${cashAmount} + ${tdAmount} TD`, type: "Combo Split" };
    }
    return { amount: `HK$${price.toFixed(2)}`, type: null };
  };

  const priceInfo = getPriceDisplay();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header forceSolid />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Back Button */}
        <Link href="/events">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Image */}
            {event.images && event.images.length > 0 && (
              <div className="rounded-lg overflow-hidden">
                <img 
                  src={event.images[0]} 
                  alt={event.title || "Event"} 
                  className="w-full h-96 object-cover"
                  data-testid="img-event"
                />
              </div>
            )}

            {/* Title and Description */}
            <div>
              <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white" data-testid="text-title">
                {event.title}
              </h1>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="default" data-testid="badge-price">
                  {priceInfo.amount}
                </Badge>
                {priceInfo.type && (
                  <Badge variant="outline">{priceInfo.type}</Badge>
                )}
              </div>

              {event.description && (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap" data-testid="text-description">
                    {event.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Event Details */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">
                    Event Details
                  </h3>

                  <div className="space-y-4">
                    {/* Date & Time */}
                    {event.eventDate && (
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {format(new Date(event.eventDate), "EEEE, MMMM dd, yyyy")}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {format(new Date(event.eventDate), "h:mm a")}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    <div className="flex items-start gap-3">
                      {event.isOnlineOnly ? (
                        <>
                          <Globe className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">Online Event</p>
                            {event.website && (
                              <a 
                                href={event.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline"
                              >
                                Join Online
                              </a>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {event.address || "Location TBA"}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Capacity */}
                    {event.capacity && (
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Capacity: {event.capacity} attendees
                          </p>
                          {event.attendeeCount !== undefined && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {event.attendeeCount} registered
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-start gap-3">
                      {event.paymentType === "timedollar_only" || event.paymentType === "combo_split" ? (
                        <Coins className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      ) : (
                        <DollarSign className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {priceInfo.amount}
                        </p>
                        {priceInfo.type && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {priceInfo.type}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Register Button */}
                <Button className="w-full" size="lg" data-testid="button-register">
                  Register for Event
                </Button>

                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  By registering, you agree to the event terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
