import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Calendar, Plus, Edit, Trash2, Users, MapPin } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Listing } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function UserEvents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingEvent, setEditingEvent] = useState<Listing | null>(null);
  const [eventToDelete, setEventToDelete] = useState<Listing | null>(null);

  const { data: userListings, isLoading } = useQuery<Listing[]>({
    queryKey: ['/api/listings/user'],
    enabled: !!user,
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/listings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings/user'] });
      toast({ title: "Event deleted successfully" });
      setEventToDelete(null);
    },
    onError: () => {
      toast({ title: "Failed to delete event", variant: "destructive" });
      setEventToDelete(null);
    },
  });

  const handleEdit = (event: Listing) => {
    // TODO: Create AddEventModal component
    toast({ 
      title: "Event editing coming soon", 
      description: "Event editing functionality will be available once AddEventModal is implemented." 
    });
  };

  const handleDelete = (event: Listing) => {
    setEventToDelete(event);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      deleteEventMutation.mutate(eventToDelete.id);
    }
  };

  const events = userListings?.filter(item => item.type === 'event') || [];

  const renderEventCard = (event: Listing) => (
    <Card key={event.id} className="hover:shadow-lg transition-shadow" data-testid={`card-event-${event.id}`}>
      {event.images && event.images.length > 0 && (
        <img src={event.images[0]} alt={event.title} className="w-full h-48 object-cover rounded-t-lg" />
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant={event.status === 'published' ? 'default' : event.status === 'pending' ? 'secondary' : 'destructive'}>
                {event.status}
              </Badge>
              {event.eventDate && (
                <Badge variant="outline">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(event.eventDate).toLocaleDateString()}
                </Badge>
              )}
              {event.capacity && (
                <Badge variant="outline">
                  <Users className="w-3 h-3 mr-1" />
                  {event.attendeeCount || 0}/{event.capacity}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleEdit(event)}
              data-testid={`button-edit-${event.id}`}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleDelete(event)}
              data-testid={`button-delete-${event.id}`}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {event.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{event.description}</p>
        )}
        {event.address && (
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mr-2" />
            {event.address}
          </div>
        )}
        {event.eventPrice && (
          <div className="text-sm font-semibold">
            ${parseFloat(event.eventPrice.toString()).toFixed(2)}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (user?.vendorStatus !== 'verified') {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Vendor Verification Required</h2>
        <p className="text-gray-600 mb-4">You need to be a verified vendor to access this section.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Events</h2>
          <p className="text-gray-600">Manage your event listings</p>
        </div>
        <Button data-testid="button-add-event">
          <Plus className="w-4 h-4 mr-2" />
          Create New Event
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {events.filter(e => e.status === 'published' && e.eventDate && new Date(e.eventDate) > new Date()).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Attendees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {events.reduce((sum, e) => sum + (e.attendeeCount || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading events...</p>
        </div>
      ) : events.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map(renderEventCard)}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No events yet</p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Event
            </Button>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{eventToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
