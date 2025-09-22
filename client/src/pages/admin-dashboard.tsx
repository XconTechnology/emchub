import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  MapPin, 
  Phone, 
  Mail, 
  Users,
  LogOut,
  Calendar,
  User
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import AdminLogin from "./admin-login";
import type { Listing, User as UserType } from "@shared/schema";

interface ModerationAction {
  type: 'approve' | 'reject';
  listingId: string;
  listing: Listing;
  reason?: string;
  notes?: string;
}

export default function AdminDashboard() {
  const { isAdminAuthenticated, adminLogout, checkAdminAuth } = useAdminAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [actionDialog, setActionDialog] = useState<ModerationAction | null>(null);
  const [actionNotes, setActionNotes] = useState("");

  const handleAdminLoginSuccess = () => {
    checkAdminAuth();
    toast({
      title: "Admin Login Successful",
      description: "Welcome to the admin dashboard",
    });
  };

  const handleLogout = () => {
    adminLogout();
    toast({
      title: "Logged Out",
      description: "You have been logged out of the admin panel",
    });
  };

  // Fetch listings by status (only if authenticated)
  const { data: pendingListings = [], isLoading: isPendingLoading } = useQuery<Listing[]>({
    queryKey: ['/api/admin/listings', 'pending'],
    queryFn: () => fetch('/api/admin/listings?status=pending', { credentials: 'include' }).then(res => res.json()),
    enabled: isAdminAuthenticated,
  });

  const { data: approvedListings = [], isLoading: isApprovedLoading } = useQuery<Listing[]>({
    queryKey: ['/api/admin/listings', 'approved'],
    queryFn: () => fetch('/api/admin/listings?status=approved', { credentials: 'include' }).then(res => res.json()),
    enabled: isAdminAuthenticated,
  });

  const { data: rejectedListings = [], isLoading: isRejectedLoading } = useQuery<Listing[]>({
    queryKey: ['/api/admin/listings', 'rejected'],
    queryFn: () => fetch('/api/admin/listings?status=rejected', { credentials: 'include' }).then(res => res.json()),
    enabled: isAdminAuthenticated,
  });

  // Fetch all users
  const { data: users = [], isLoading: isUsersLoading } = useQuery<UserType[]>({
    queryKey: ['/api/admin/users'],
    queryFn: () => fetch('/api/admin/users', { credentials: 'include' }).then(res => res.json()),
    enabled: isAdminAuthenticated,
  });

  // Approve listing mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const response = await fetch(`/api/admin/listings/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notes }),
      });
      if (!response.ok) throw new Error('Failed to approve listing');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
      toast({
        title: "Listing Approved",
        description: "The listing has been approved and is now visible to the public.",
      });
      setActionDialog(null);
      setActionNotes("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to approve listing. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Reject listing mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await fetch(`/api/admin/listings/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error('Failed to reject listing');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
      toast({
        title: "Listing Rejected",
        description: "The listing has been rejected and the user has been notified.",
      });
      setActionDialog(null);
      setActionNotes("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reject listing. Please try again.",
        variant: "destructive",
      });
    }
  });

  if (!isAdminAuthenticated) {
    return <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />;
  }

  const handleApprove = (listing: Listing) => {
    setActionDialog({
      type: 'approve',
      listingId: listing.id,
      listing,
    });
  };

  const handleReject = (listing: Listing) => {
    setActionDialog({
      type: 'reject',
      listingId: listing.id,
      listing,
    });
  };

  const handleActionConfirm = () => {
    if (!actionDialog) return;

    if (actionDialog.type === 'approve') {
      approveMutation.mutate({
        id: actionDialog.listingId,
        notes: actionNotes.trim() || undefined,
      });
    } else {
      if (!actionNotes.trim()) {
        toast({
          title: "Rejection Reason Required",
          description: "Please provide a reason for rejecting this listing.",
          variant: "destructive",
        });
        return;
      }
      rejectMutation.mutate({
        id: actionDialog.listingId,
        reason: actionNotes.trim(),
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'N/A';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ListingCard = ({ listing }: { listing: Listing }) => (
    <Card className="mb-4" data-testid={`listing-card-${listing.id}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{listing.title}</CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              {getStatusBadge(listing.moderationStatus)}
              <Badge variant="outline">{listing.type}</Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedListing(listing)}
              data-testid={`button-view-${listing.id}`}
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            {listing.moderationStatus === 'pending' && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleApprove(listing)}
                  data-testid={`button-approve-${listing.id}`}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleReject(listing)}
                  data-testid={`button-reject-${listing.id}`}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-2">{listing.description}</p>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          {listing.address && (
            <span className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {listing.address}, {listing.city}
            </span>
          )}
          {listing.phone && (
            <span className="flex items-center">
              <Phone className="w-3 h-3 mr-1" />
              {listing.phone}
            </span>
          )}
          {listing.email && (
            <span className="flex items-center">
              <Mail className="w-3 h-3 mr-1" />
              {listing.email}
            </span>
          )}
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Created: {formatDate(listing.createdAt)}
          {listing.moderatedAt && (
            <span className="ml-4">
              Moderated: {formatDate(listing.moderatedAt)}
            </span>
          )}
        </div>
        {listing.moderationNotes && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
            <strong>Notes:</strong> {listing.moderationNotes}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const UserCard = ({ user }: { user: UserType }) => (
    <Card className="mb-4" data-testid={`user-card-${user.id}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{user.firstName} {user.lastName}</CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role}
              </Badge>
              <span className="text-sm text-gray-500">@{user.username}</span>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(user.createdAt)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2" />
            {user.email}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2" />
            User ID: {user.id}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage listings and monitor users</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="text-red-600 border-red-300 hover:bg-red-50"
          data-testid="button-admin-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" data-testid="tab-pending">
            Pending ({pendingListings.length})
          </TabsTrigger>
          <TabsTrigger value="approved" data-testid="tab-approved">
            Approved ({approvedListings.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" data-testid="tab-rejected">
            Rejected ({rejectedListings.length})
          </TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">
            <Users className="w-4 h-4 mr-1" />
            Users ({users.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Pending Listings</h2>
            {isPendingLoading ? (
              <div>Loading pending listings...</div>
            ) : pendingListings.length === 0 ? (
              <p className="text-gray-500">No pending listings</p>
            ) : (
              pendingListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Approved Listings</h2>
            {isApprovedLoading ? (
              <div>Loading approved listings...</div>
            ) : approvedListings.length === 0 ? (
              <p className="text-gray-500">No approved listings</p>
            ) : (
              approvedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Rejected Listings</h2>
            {isRejectedLoading ? (
              <div>Loading rejected listings...</div>
            ) : rejectedListings.length === 0 ? (
              <p className="text-gray-500">No rejected listings</p>
            ) : (
              rejectedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Registered Users</h2>
            {isUsersLoading ? (
              <div>Loading users...</div>
            ) : users.length === 0 ? (
              <p className="text-gray-500">No registered users</p>
            ) : (
              users.map((user) => (
                <UserCard key={user.id} user={user} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Detailed view dialog */}
      {selectedListing && (
        <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedListing.title}</DialogTitle>
              <DialogDescription>
                Detailed view of listing submission
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <p className="font-medium">{selectedListing.type}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedListing.moderationStatus)}</div>
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <p className="mt-1">{selectedListing.description}</p>
              </div>

              {selectedListing.address && (
                <div>
                  <Label>Address</Label>
                  <p className="mt-1">{selectedListing.address}, {selectedListing.city} {selectedListing.postalCode}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <p className="mt-1">{selectedListing.phone}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="mt-1">{selectedListing.email}</p>
                </div>
              </div>

              {selectedListing.website && (
                <div>
                  <Label>Website</Label>
                  <p className="mt-1">
                    <a href={selectedListing.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {selectedListing.website}
                    </a>
                  </p>
                </div>
              )}

              {selectedListing.moderationNotes && (
                <div>
                  <Label>Moderation Notes</Label>
                  <p className="mt-1 p-2 bg-gray-50 rounded">{selectedListing.moderationNotes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Action confirmation dialog */}
      {actionDialog && (
        <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionDialog.type === 'approve' ? 'Approve' : 'Reject'} Listing
              </DialogTitle>
              <DialogDescription>
                {actionDialog.type === 'approve' 
                  ? 'Are you sure you want to approve this listing? It will be visible to the public.'
                  : 'Are you sure you want to reject this listing? Please provide a reason.'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Listing: {actionDialog.listing.title}</Label>
              </div>
              <div>
                <Label htmlFor="action-notes">
                  {actionDialog.type === 'approve' ? 'Notes (optional)' : 'Rejection Reason (required)'}
                </Label>
                <Textarea
                  id="action-notes"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder={
                    actionDialog.type === 'approve' 
                      ? 'Optional notes for this approval...'
                      : 'Please explain why this listing is being rejected...'
                  }
                  data-testid="textarea-action-notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setActionDialog(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleActionConfirm}
                variant={actionDialog.type === 'approve' ? 'default' : 'destructive'}
                disabled={approveMutation.isPending || rejectMutation.isPending}
                data-testid={`button-confirm-${actionDialog.type}`}
              >
                {actionDialog.type === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}