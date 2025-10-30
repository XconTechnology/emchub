import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
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
import { apiRequest, queryClient } from "@/lib/queryClient";

// Registration form schema
const registrationSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  notes: z.string().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function EventDetailPage() {
  const [, params] = useRoute("/event/:id");
  const eventId = params?.id;
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: events, isLoading } = useQuery<Listing[]>({
    queryKey: ['/api/listings'],
  });

  const event = events?.find(e => e.id === eventId && e.type === 'event');

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      notes: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      if (!eventId) throw new Error("Event ID is required");
      const response = await apiRequest("POST", `/api/events/${eventId}/register`, data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "You've successfully registered for this event. Check your email for confirmation.",
      });
      setIsRegisterDialogOpen(false);
      form.reset();
      // Invalidate events query to update attendee count
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Unable to register for this event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegistrationFormData) => {
    registerMutation.mutate(data);
  };

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
                <Button 
                  className="w-full" 
                  size="lg" 
                  data-testid="button-register"
                  onClick={() => setIsRegisterDialogOpen(true)}
                  disabled={!!(event.capacity && event.attendeeCount && event.attendeeCount >= event.capacity)}
                >
                  {event.capacity && event.attendeeCount && event.attendeeCount >= event.capacity 
                    ? "Event Full" 
                    : "Register for Event"
                  }
                </Button>

                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  By registering, you agree to the event terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Registration Dialog */}
      <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Register for Event</DialogTitle>
            <DialogDescription>
              Fill in your details to register for {event?.title}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Doe" 
                        {...field} 
                        data-testid="input-fullname"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="john@example.com" 
                        {...field} 
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input 
                        type="tel"
                        placeholder="+852 1234 5678" 
                        {...field} 
                        data-testid="input-phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special requirements or questions..."
                        className="resize-none"
                        {...field}
                        data-testid="input-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsRegisterDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={registerMutation.isPending}
                  data-testid="button-submit-registration"
                >
                  {registerMutation.isPending ? "Registering..." : "Complete Registration"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
