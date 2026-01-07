import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  MapPin,
  Users,
  Coins,
  Clock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Send
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, EventHostingRequest } from "@shared/schema";

const hostingRequestSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  eventType: z.enum(["event", "project", "workshop", "community_service"]),
  proposedDate: z.string().optional(),
  proposedLocation: z.string().optional(),
  expectedAttendees: z.string().optional(),
  tdPriceProposal: z.string().optional(),
  hoursProposal: z.string().optional(),
  additionalNotes: z.string().optional(),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().optional(),
});

type HostingRequestFormData = z.infer<typeof hostingRequestSchema>;

export default function HostEventPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [submitted, setSubmitted] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/me"],
  });

  const { data: myRequests, isLoading: requestsLoading } = useQuery<EventHostingRequest[]>({
    queryKey: ["/api/event-hosting-requests"],
    enabled: !!user,
  });

  const form = useForm<HostingRequestFormData>({
    resolver: zodResolver(hostingRequestSchema),
    defaultValues: {
      title: "",
      description: "",
      eventType: "event",
      proposedDate: "",
      proposedLocation: "",
      expectedAttendees: "",
      tdPriceProposal: "",
      hoursProposal: "",
      additionalNotes: "",
      contactEmail: user?.email || "",
      contactPhone: user?.phone || "",
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: HostingRequestFormData) => {
      const payload = {
        ...data,
        proposedDate: data.proposedDate ? new Date(data.proposedDate) : null,
        expectedAttendees: data.expectedAttendees ? parseInt(data.expectedAttendees) : null,
        tdPriceProposal: data.tdPriceProposal ? parseInt(data.tdPriceProposal) : null,
        hoursProposal: data.hoursProposal || null,
      };
      const res = await apiRequest("POST", "/api/event-hosting-requests", payload);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted",
        description: "Your event hosting request has been submitted for admin review.",
      });
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/event-hosting-requests"] });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit request",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: HostingRequestFormData) => {
    createRequestMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "event": return "Event";
      case "project": return "Project";
      case "workshop": return "Workshop";
      case "community_service": return "Community Service";
      default: return type;
    }
  };

  if (userLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="text-center">
              <CardContent className="py-12">
                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Login Required</h2>
                <p className="text-gray-600 mb-6">
                  You need to be logged in to submit an event hosting request.
                </p>
                <Link href="/auth">
                  <Button className="bg-[#8FC24C] hover:bg-[#7AB03D]">
                    Login or Sign Up
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/how-timebanks-work">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to TimeDollars
            </Button>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Host an Event or Project</h1>
            <p className="text-gray-600">
              Submit your event or project proposal for admin review. Once approved, 
              you'll be able to create and manage your event on EMC HUB.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {submitted ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Request Submitted!</h2>
                    <p className="text-gray-600 mb-6">
                      Your event hosting request has been submitted and is awaiting admin review.
                      You'll be notified once a decision is made.
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={() => setSubmitted(false)}
                        variant="outline"
                        data-testid="button-submit-another"
                      >
                        Submit Another Request
                      </Button>
                      <Link href="/dashboard">
                        <Button className="bg-[#8FC24C] hover:bg-[#7AB03D]" data-testid="button-go-dashboard">
                          Go to Dashboard
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Event/Project Proposal</CardTitle>
                    <CardDescription>
                      Fill out the form below with details about your event or project.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event/Project Title *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter the title of your event or project" 
                                  {...field} 
                                  data-testid="input-title"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="eventType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-event-type">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="event">Event</SelectItem>
                                  <SelectItem value="project">Project</SelectItem>
                                  <SelectItem value="workshop">Workshop</SelectItem>
                                  <SelectItem value="community_service">Community Service</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description *</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe your event or project in detail..."
                                  rows={5}
                                  {...field} 
                                  data-testid="input-description"
                                />
                              </FormControl>
                              <FormDescription>
                                Include details about the purpose, target audience, and what participants can expect.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="proposedDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Proposed Date</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="datetime-local" 
                                    {...field} 
                                    data-testid="input-proposed-date"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="proposedLocation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Proposed Location</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="e.g., Community Center, Online" 
                                    {...field} 
                                    data-testid="input-location"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="expectedAttendees"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expected Attendees</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="e.g., 50" 
                                    {...field} 
                                    data-testid="input-attendees"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="tdPriceProposal"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Proposed TD Price</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="e.g., 2" 
                                    {...field} 
                                    data-testid="input-td-price"
                                  />
                                </FormControl>
                                <FormDescription>TimeDollars</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="hoursProposal"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duration (Hours)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.5"
                                    placeholder="e.g., 2.5" 
                                    {...field} 
                                    data-testid="input-hours"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="additionalNotes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Additional Notes</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Any additional information..."
                                  rows={3}
                                  {...field} 
                                  data-testid="input-notes"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="border-t pt-6">
                          <h3 className="font-semibold mb-4">Contact Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="contactEmail"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Contact Email *</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="email" 
                                      placeholder="your@email.com" 
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
                              name="contactPhone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Contact Phone</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="tel" 
                                      placeholder="+852 XXXX XXXX" 
                                      {...field} 
                                      data-testid="input-phone"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full bg-[#8FC24C] hover:bg-[#7AB03D]"
                          disabled={createRequestMutation.isPending}
                          data-testid="button-submit-request"
                        >
                          {createRequestMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Submit Request for Approval
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#8FC24C] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      1
                    </div>
                    <p className="text-gray-600">Submit your event/project proposal with details</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#8FC24C] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      2
                    </div>
                    <p className="text-gray-600">Admin reviews and approves your request</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#8FC24C] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      3
                    </div>
                    <p className="text-gray-600">Once approved, create and publish your event</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#8FC24C] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      4
                    </div>
                    <p className="text-gray-600">Earn TimeDollars when participants complete</p>
                  </div>
                </CardContent>
              </Card>

              {myRequests && myRequests.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">My Requests</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {myRequests.map((request) => (
                      <div 
                        key={request.id} 
                        className="border rounded-lg p-3"
                        data-testid={`request-item-${request.id}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm truncate flex-1">{request.title}</h4>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-xs text-gray-500">
                          {getEventTypeLabel(request.eventType)} • 
                          Submitted {request.createdAt ? format(new Date(request.createdAt), "MMM d, yyyy") : ""}
                        </p>
                        {request.status === "rejected" && request.rejectionReason && (
                          <p className="text-xs text-red-600 mt-2">
                            Reason: {request.rejectionReason}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card className="bg-[#8FC24C]/10 border-[#8FC24C]">
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-5 h-5 text-[#8FC24C]" />
                    <span className="font-semibold text-[#8FC24C]">Earn TimeDollars</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    Host events and earn TimeDollars when participants complete their registration.
                    Use TD to access services on EMC HUB!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
