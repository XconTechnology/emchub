import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, MapPin, Users, DollarSign, Search, Clock, Globe, Home } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Listing } from "@shared/schema";
import { format } from "date-fns";

export default function AdminEvents() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Listing | null>(null);
  const [action, setAction] = useState<"approve" | "reject">("approve");

  const { data: allEvents = [], isLoading } = useQuery<Listing[]>({
    queryKey: ['/api/admin/listings', 'events'],
    queryFn: () => fetch('/api/admin/listings', { credentials: 'include' }).then(res => res.json()),
    select: (data) => data.filter(listing => listing.type === 'event'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest('PUT', `/api/admin/listings/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      toast({
        title: action === "approve" ? "Event Approved" : "Event Rejected",
        description: action === "approve" 
          ? "The event has been approved and is now visible to the public."
          : "The event has been rejected and moved to draft status.",
      });
      setApprovalDialogOpen(false);
      setSelectedEvent(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update event status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredEvents = allEvents.filter(event => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      event.title?.toLowerCase().includes(searchLower) ||
      event.description?.toLowerCase().includes(searchLower) ||
      event.address?.toLowerCase().includes(searchLower)
    );
  });

  const pendingEvents = filteredEvents.filter(e => e.status === 'pending');
  const approvedEvents = filteredEvents.filter(e => e.status === 'published');
  const rejectedEvents = filteredEvents.filter(e => e.status === 'rejected');

  const handleApprove = (event: Listing) => {
    setSelectedEvent(event);
    setAction("approve");
    setApprovalDialogOpen(true);
  };

  const handleReject = (event: Listing) => {
    setSelectedEvent(event);
    setAction("reject");
    setApprovalDialogOpen(true);
  };

  const handleViewDetails = (event: Listing) => {
    setSelectedEvent(event);
    setViewDetailsOpen(true);
  };

  const confirmAction = () => {
    if (selectedEvent) {
      updateStatusMutation.mutate({
        id: selectedEvent.id,
        status: action === "approve" ? "published" : "rejected"
      });
    }
  };

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

  const renderEventCard = (event: Listing) => {
    const location = getLocationDisplay(event);
    const LocationIcon = location.icon;

    return (
      <Card key={event.id} className="mb-4 hover:shadow-lg transition-shadow" data-testid={`event-card-${event.id}`}>
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                {event.images && event.images.length > 0 && (
                  <img 
                    src={event.images[0]} 
                    alt={event.title} 
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2" data-testid={`text-title-${event.id}`}>
                    {event.title}
                  </CardTitle>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge 
                      variant={
                        event.status === 'published' ? 'default' : 
                        event.status === 'pending' ? 'secondary' : 
                        event.status === 'rejected' ? 'destructive' :
                        'outline'
                      }
                      data-testid={`badge-status-${event.id}`}
                    >
                      {event.status}
                    </Badge>
                    <Badge variant="outline">
                      {getPriceDisplay(event)}
                    </Badge>
                  </div>

                  {event.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                      {event.description}
                    </p>
                  )}

                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    {event.eventDate && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{format(new Date(event.eventDate), "MMM dd, yyyy 'at' h:mm a")}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <LocationIcon className="w-4 h-4" />
                      <span className="line-clamp-1">{location.text}</span>
                    </div>

                    {event.capacity && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>Max {event.capacity} attendees</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => handleViewDetails(event)}
                data-testid={`button-view-${event.id}`}
              >
                View Details
              </Button>
              {event.status === 'pending' && (
                <>
                  <Button 
                    variant="default"
                    size="sm"
                    onClick={() => handleApprove(event)}
                    data-testid={`button-approve-${event.id}`}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant="destructive"
                    size="sm"
                    onClick={() => handleReject(event)}
                    data-testid={`button-reject-${event.id}`}
                  >
                    Reject
                  </Button>
                </>
              )}
              {event.status === 'published' && (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleReject(event)}
                  data-testid={`button-unpublish-${event.id}`}
                >
                  Unpublish
                </Button>
              )}
              {(event.status === 'rejected' || event.status === 'draft') && (
                <Button 
                  variant="default"
                  size="sm"
                  onClick={() => handleApprove(event)}
                  data-testid={`button-publish-${event.id}`}
                >
                  Publish
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading events...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
            Events Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Approve and manage community events
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search events by title, description, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          data-testid="input-search-events"
        />
      </div>

      {/* Tabs for filtering */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4" data-testid="tabs-event-status">
          <TabsTrigger value="all" data-testid="tab-all">
            All Events ({filteredEvents.length})
          </TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">
            Pending ({pendingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="approved" data-testid="tab-approved">
            Approved ({approvedEvents.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" data-testid="tab-rejected">
            Rejected ({rejectedEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-400" data-testid="text-no-events">
                  No events found
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredEvents.map(event => renderEventCard(event))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-400" data-testid="text-no-pending">
                  No pending events
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingEvents.map(event => renderEventCard(event))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-400" data-testid="text-no-approved">
                  No approved events
                </p>
              </CardContent>
            </Card>
          ) : (
            approvedEvents.map(event => renderEventCard(event))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-400" data-testid="text-no-rejected">
                  No rejected events
                </p>
              </CardContent>
            </Card>
          ) : (
            rejectedEvents.map(event => renderEventCard(event))
          )}
        </TabsContent>
      </Tabs>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-event-details">
          <DialogHeader>
            <DialogTitle className="text-2xl">Event Details</DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-6">
              {/* Event Image */}
              {selectedEvent.images && selectedEvent.images.length > 0 && (
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={selectedEvent.images[0]} 
                    alt={selectedEvent.title} 
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              {/* Title and Status */}
              <div>
                <h3 className="text-2xl font-bold mb-2">{selectedEvent.title}</h3>
                <div className="flex gap-2 mb-4">
                  <Badge variant={
                    selectedEvent.status === 'published' ? 'default' : 
                    selectedEvent.status === 'pending' ? 'secondary' : 
                    selectedEvent.status === 'rejected' ? 'destructive' :
                    'outline'
                  }>
                    {selectedEvent.status}
                  </Badge>
                  <Badge variant="outline">
                    {getPriceDisplay(selectedEvent)}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              {selectedEvent.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              {/* Event Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date & Time */}
                {selectedEvent.eventDate && (
                  <div className="space-y-1">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date & Time
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {format(new Date(selectedEvent.eventDate), "EEEE, MMMM dd, yyyy")}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(selectedEvent.eventDate), "h:mm a")}
                    </p>
                  </div>
                )}

                {/* Location */}
                <div className="space-y-1">
                  <h4 className="font-semibold flex items-center gap-2">
                    {selectedEvent.isOnlineOnly ? (
                      <Globe className="w-4 h-4" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                    Location
                  </h4>
                  {selectedEvent.isOnlineOnly ? (
                    <>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Online Event</p>
                      {selectedEvent.website && (
                        <a 
                          href={selectedEvent.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {selectedEvent.website}
                        </a>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedEvent.address || "Location TBA"}
                    </p>
                  )}
                </div>

                {/* Capacity */}
                {selectedEvent.capacity && (
                  <div className="space-y-1">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Capacity
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedEvent.capacity} attendees
                    </p>
                  </div>
                )}

                {/* Price & Payment */}
                <div className="space-y-1">
                  <h4 className="font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Price & Payment
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {getPriceDisplay(selectedEvent)}
                  </p>
                  {selectedEvent.paymentType && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                      {selectedEvent.paymentType.replace(/_/g, ' ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedEvent.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    variant="default"
                    className="flex-1"
                    onClick={() => {
                      setViewDetailsOpen(false);
                      handleApprove(selectedEvent);
                    }}
                  >
                    Approve Event
                  </Button>
                  <Button 
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setViewDetailsOpen(false);
                      handleReject(selectedEvent);
                    }}
                  >
                    Reject Event
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent data-testid="dialog-confirm-action">
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve Event" : "Reject Event"}
            </DialogTitle>
            <DialogDescription>
              {action === "approve" 
                ? "Are you sure you want to approve this event? It will be visible to the public."
                : "Are you sure you want to reject this event? It will be marked as rejected and hidden from the public."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setApprovalDialogOpen(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              variant={action === "approve" ? "default" : "destructive"}
              onClick={confirmAction}
              disabled={updateStatusMutation.isPending}
              data-testid="button-confirm"
            >
              {updateStatusMutation.isPending ? "Processing..." : 
                action === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
