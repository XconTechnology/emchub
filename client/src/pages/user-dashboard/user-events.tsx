import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Calendar, Plus, Edit, Trash2, Users, MapPin, Eye, QrCode, CheckCircle, X, Camera } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Listing, EventRegistration } from "@shared/schema";
import AddEventModal from "@/components/AddEventModal";
import { Scanner } from "@yudiel/react-qr-scanner";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface VerifiedRegistration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
  status: string;
  createdAt: string;
}

interface VerificationResult {
  success: boolean;
  registration: VerifiedRegistration;
  event: {
    id: string;
    title: string;
    eventDate: string;
    address: string;
  };
}

export default function UserEvents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Listing | null>(null);
  const [eventToDelete, setEventToDelete] = useState<Listing | null>(null);
  const [viewingRegistrations, setViewingRegistrations] = useState<Listing | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanningForEvent, setScanningForEvent] = useState<Listing | null>(null);
  const [verifiedRegistration, setVerifiedRegistration] = useState<VerificationResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const { data: userListings, isLoading } = useQuery<Listing[]>({
    queryKey: ['/api/listings/user'],
    enabled: !!user,
  });

  const { data: registrations, isLoading: isLoadingRegistrations } = useQuery<EventRegistration[]>({
    queryKey: ['/api/vendor/events', viewingRegistrations?.id, 'registrations'],
    enabled: !!viewingRegistrations?.id,
  });

  // Fetch all registrations for vendor
  const { data: allRegistrations, isLoading: isLoadingAllRegistrations } = useQuery<any[]>({
    queryKey: ['/api/vendor/all-registrations'],
    enabled: !!user && user.vendorStatus === 'verified',
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

  const verifyRegistrationMutation = useMutation({
    mutationFn: async ({ eventId, qrPayload }: { eventId: string; qrPayload: string }) => {
      const response = await apiRequest('POST', `/api/vendor/events/${eventId}/verify-registration`, { qrPayload });
      return response as unknown as VerificationResult;
    },
    onSuccess: (data) => {
      setVerifiedRegistration(data);
      setScanError(null);
    },
    onError: (error: Error) => {
      setScanError(error.message || "Failed to verify registration");
      setVerifiedRegistration(null);
    },
  });

  const checkInMutation = useMutation({
    mutationFn: async (registrationId: string) => {
      await apiRequest('PATCH', `/api/vendor/registrations/${registrationId}/checkin`);
    },
    onSuccess: () => {
      toast({ title: "Attendee checked in successfully!" });
      setVerifiedRegistration(null);
      setIsScannerOpen(false);
      setScanningForEvent(null);
      queryClient.invalidateQueries({ queryKey: ['/api/vendor/all-registrations'] });
      if (viewingRegistrations?.id) {
        queryClient.invalidateQueries({ queryKey: ['/api/vendor/events', viewingRegistrations.id, 'registrations'] });
      }
    },
    onError: () => {
      toast({ title: "Failed to check in attendee", variant: "destructive" });
    },
  });

  const handleScanQR = (event: Listing) => {
    setScanningForEvent(event);
    setIsScannerOpen(true);
    setVerifiedRegistration(null);
    setScanError(null);
  };

  const handleQRScan = (result: any) => {
    if (result && result[0]?.rawValue && scanningForEvent) {
      const qrData = result[0].rawValue;
      verifyRegistrationMutation.mutate({
        eventId: scanningForEvent.id,
        qrPayload: qrData,
      });
    }
  };

  const closeScannerDialog = () => {
    setIsScannerOpen(false);
    setScanningForEvent(null);
    setVerifiedRegistration(null);
    setScanError(null);
  };

  const handleEdit = (event: Listing) => {
    setEditingEvent(event);
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
            {event.status === 'published' && (event.attendeeCount || 0) > 0 && (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleScanQR(event)}
                  data-testid={`button-scan-qr-${event.id}`}
                  title="Scan QR Code"
                >
                  <QrCode className="w-4 h-4 text-green-500" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setViewingRegistrations(event)}
                  data-testid={`button-view-attendees-${event.id}`}
                  title="View Attendees"
                >
                  <Eye className="w-4 h-4 text-blue-500" />
                </Button>
              </>
            )}
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
        <Button onClick={() => setIsAddModalOpen(true)} data-testid="button-add-event">
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
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Event
            </Button>
          </CardContent>
        </Card>
      )}

      {/* All Registrations Section */}
      {allRegistrations && allRegistrations.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl">All Event Registrations</CardTitle>
            <p className="text-sm text-gray-600">View and manage all registrations across your events</p>
          </CardHeader>
          <CardContent>
            {isLoadingAllRegistrations ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading registrations...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Attendee Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registered Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allRegistrations.map((registration) => (
                      <TableRow key={registration.id} data-testid={`row-all-registration-${registration.id}`}>
                        <TableCell className="font-medium">
                          {registration.eventTitle || 'Unknown Event'}
                          {registration.eventDate && (
                            <div className="text-xs text-gray-500">
                              {new Date(registration.eventDate).toLocaleDateString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{registration.fullName}</TableCell>
                        <TableCell>{registration.email}</TableCell>
                        <TableCell>{registration.phone || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate" title={registration.notes || ''}>
                          {registration.notes || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={registration.status === 'confirmed' ? 'default' : 'secondary'}>
                            {registration.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {registration.createdAt ? new Date(registration.createdAt).toLocaleDateString() : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <AddEventModal 
        isOpen={isAddModalOpen || !!editingEvent}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingEvent(null);
        }}
        editEvent={editingEvent}
      />

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

      {/* Attendees Dialog */}
      <Dialog open={!!viewingRegistrations} onOpenChange={(open) => !open && setViewingRegistrations(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Event Attendees</DialogTitle>
            <DialogDescription>
              Registered attendees for {viewingRegistrations?.title}
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingRegistrations ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading registrations...</p>
            </div>
          ) : registrations && registrations.length > 0 ? (
            <div className="mt-4">
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-semibold">
                  Total Registrations: {registrations.length}
                  {viewingRegistrations?.capacity && (
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      / {viewingRegistrations.capacity} capacity
                    </span>
                  )}
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((registration) => (
                    <TableRow key={registration.id} data-testid={`row-registration-${registration.id}`}>
                      <TableCell className="font-medium">{registration.fullName}</TableCell>
                      <TableCell>{registration.email}</TableCell>
                      <TableCell>{registration.phone}</TableCell>
                      <TableCell className="max-w-xs truncate" title={registration.notes || ''}>
                        {registration.notes || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={registration.status === 'confirmed' ? 'default' : 'secondary'}>
                          {registration.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {registration.createdAt ? new Date(registration.createdAt).toLocaleDateString() : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No registrations yet for this event</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Code Scanner Dialog */}
      <Dialog open={isScannerOpen} onOpenChange={(open) => !open && closeScannerDialog()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Scan Attendee QR Code
            </DialogTitle>
            <DialogDescription>
              Scan the attendee's QR code to verify their registration for {scanningForEvent?.title}
            </DialogDescription>
          </DialogHeader>

          {!verifiedRegistration ? (
            <div className="space-y-4">
              {/* QR Scanner */}
              <div className="relative aspect-square max-h-[300px] overflow-hidden rounded-lg border bg-black">
                {!verifyRegistrationMutation.isPending && !scanError && (
                  <Scanner
                    onScan={handleQRScan}
                    onError={(error: any) => setScanError(error?.message || "Camera access denied")}
                    constraints={{ facingMode: "environment" }}
                    styles={{
                      container: { width: "100%", height: "100%" },
                      video: { width: "100%", height: "100%", objectFit: "cover" }
                    }}
                  />
                )}
                {verifyRegistrationMutation.isPending && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2" />
                      <p>Verifying...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error message */}
              {scanError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                  <X className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-600 dark:text-red-400 font-medium">{scanError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setScanError(null)}
                    data-testid="button-try-again"
                  >
                    Try Again
                  </Button>
                </div>
              )}


              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Camera className="w-4 h-4" />
                <span>Point your camera at the attendee's QR code</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Verification Success */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-green-600 dark:text-green-400 font-semibold text-lg">Registration Verified!</p>
              </div>

              {/* Attendee Details */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">Attendee Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs uppercase tracking-wide">Name</span>
                    <span className="font-medium text-gray-900 dark:text-white" data-testid="text-verified-name">
                      {verifiedRegistration.registration.fullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs uppercase tracking-wide">Phone</span>
                    <span className="font-medium text-gray-900 dark:text-white" data-testid="text-verified-phone">
                      {verifiedRegistration.registration.phone}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 block text-xs uppercase tracking-wide">Email</span>
                    <span className="font-medium text-gray-900 dark:text-white break-all" data-testid="text-verified-email">
                      {verifiedRegistration.registration.email}
                    </span>
                  </div>
                  {verifiedRegistration.registration.notes && (
                    <div className="col-span-2">
                      <span className="text-gray-500 block text-xs uppercase tracking-wide">Notes</span>
                      <span className="font-medium text-gray-900 dark:text-white" data-testid="text-verified-notes">
                        {verifiedRegistration.registration.notes}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500 block text-xs uppercase tracking-wide">Status</span>
                    <Badge 
                      variant={verifiedRegistration.registration.status === 'checked_in' ? 'default' : 'secondary'}
                      data-testid="badge-verified-status"
                    >
                      {verifiedRegistration.registration.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs uppercase tracking-wide">Registered</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(verifiedRegistration.registration.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setVerifiedRegistration(null);
                    setScanError(null);
                  }}
                  data-testid="button-scan-another"
                >
                  Scan Another
                </Button>
                {verifiedRegistration.registration.status !== 'checked_in' && (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => checkInMutation.mutate(verifiedRegistration.registration.id)}
                    disabled={checkInMutation.isPending}
                    data-testid="button-check-in"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {checkInMutation.isPending ? "Checking in..." : "Check In"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
