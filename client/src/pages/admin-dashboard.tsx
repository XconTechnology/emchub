import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  User,
  Plus,
  Edit,
  Trash
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertListingSchema } from "@shared/schema";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import AdminLogin from "./admin-login";
import type { Listing, User as UserType, Category } from "@shared/schema";

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
  const [activeTab, setActiveTab] = useState("all");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [actionDialog, setActionDialog] = useState<ModerationAction | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToEdit, setListingToEdit] = useState<Listing | null>(null);
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);

  const form = useForm<z.infer<typeof insertListingSchema>>({
    resolver: zodResolver(insertListingSchema),
    defaultValues: {
      type: "business",
      title: "",
      description: "",
      categoryId: "",
      phone: "",
      email: "",
      website: "",
      address: "",
      city: "",
      postalCode: "",
      latitude: "",
      longitude: "",
      isOnlineOnly: false,
      isActive: true,
      isVerified: false,
    },
  });

  const editForm = useForm<z.infer<typeof insertListingSchema>>({
    resolver: zodResolver(insertListingSchema),
    defaultValues: {
      type: "business",
      title: "",
      description: "",
      categoryId: "",
      phone: "",
      email: "",
      website: "",
      address: "",
      city: "",
      postalCode: "",
      latitude: "",
      longitude: "",
      isOnlineOnly: false,
      isActive: true,
      isVerified: false,
    },
  });

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

  // Fetch all listings (only if authenticated)
  const { data: allListings = [], isLoading: isAllLoading } = useQuery<Listing[]>({
    queryKey: ['/api/admin/listings', 'all'],
    queryFn: () => fetch('/api/admin/listings', { credentials: 'include' }).then(res => res.json()),
    enabled: isAdminAuthenticated,
  });

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

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Create listing mutation
  const createListingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertListingSchema>) => {
      return apiRequest('/api/listings', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      toast({
        title: "Listing Created",
        description: "The new listing has been created successfully and is pending approval.",
      });
      setCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    }
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

  // Seed demo data mutation
  const seedDemoMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/seed-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to seed demo data' }));
        throw new Error(errorData.error || errorData.message || 'Failed to seed demo data');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      toast({
        title: "Demo Data Seeded Successfully",
        description: `Created ${data.results.listingsCreated} listings, skipped ${data.results.listingsSkipped} existing listings.`,
      });
    },
    onError: (error: Error) => {
      console.error('Seed error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to seed demo data. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Edit listing mutation
  const editListingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof insertListingSchema> }) => {
      const response = await fetch(`/api/admin/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update listing');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      toast({
        title: "Listing Updated",
        description: "The listing has been updated successfully.",
      });
      setEditDialogOpen(false);
      setListingToEdit(null);
      editForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update listing. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete listing mutation
  const deleteListingMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/listings/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete listing');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      toast({
        title: "Listing Deleted",
        description: "The listing has been deleted successfully.",
      });
      setDeleteDialogOpen(false);
      setListingToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete listing. Please try again.",
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

  const handleEdit = (listing: Listing) => {
    setListingToEdit(listing);
    editForm.reset({
      type: listing.type || "business",
      title: listing.title || "",
      description: listing.description || "",
      categoryId: listing.categoryId || "",
      phone: listing.phone || "",
      email: listing.email || "",
      website: listing.website || "",
      address: listing.address || "",
      city: listing.city || "",
      postalCode: listing.postalCode || "",
      latitude: listing.latitude || "",
      longitude: listing.longitude || "",
      isOnlineOnly: listing.isOnlineOnly || false,
      isActive: listing.isActive ?? true,
      isVerified: listing.isVerified || false,
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (listing: Listing) => {
    setListingToDelete(listing);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (listingToDelete) {
      deleteListingMutation.mutate(listingToDelete.id);
    }
  };

  const handleEditSubmit = (data: z.infer<typeof insertListingSchema>) => {
    if (listingToEdit) {
      editListingMutation.mutate({ id: listingToEdit.id, data });
    }
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
            <Link href={`/business/${listing.id}`}>
              <Button
                variant="outline"
                size="sm"
                data-testid={`button-view-${listing.id}`}
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(listing)}
              data-testid={`button-edit-${listing.id}`}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(listing)}
              data-testid={`button-delete-${listing.id}`}
            >
              <Trash className="w-4 h-4 mr-1" />
              Delete
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
                  variant="outline"
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
        <div className="flex gap-2">
          <Button 
            variant="default" 
            onClick={() => setCreateDialogOpen(true)}
            data-testid="button-add-listing"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Listing
          </Button>
          <Button 
            variant="outline" 
            onClick={() => seedDemoMutation.mutate()}
            disabled={seedDemoMutation.isPending}
            data-testid="button-seed-demo"
          >
            {seedDemoMutation.isPending ? 'Seeding...' : 'Seed Demo Listings'}
          </Button>
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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" data-testid="tab-all">
            All Listings ({allListings.length})
          </TabsTrigger>
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

        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">All Listings</h2>
            {isAllLoading ? (
              <div>Loading all listings...</div>
            ) : allListings.length === 0 ? (
              <p className="text-gray-500">No listings found</p>
            ) : (
              allListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            )}
          </div>
        </TabsContent>

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

      {/* Create listing dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Listing</DialogTitle>
            <DialogDescription>
              Create a new business listing with all the details
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createListingMutation.mutate(data))} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="product">Product</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="school">School</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="provision-store">Provision Store</SelectItem>
                          <SelectItem value="masjid">Masjid</SelectItem>
                          <SelectItem value="services-store">Services Store</SelectItem>
                          <SelectItem value="virtual-kitchen">Virtual Kitchen</SelectItem>
                          <SelectItem value="arts-henna">Arts Henna</SelectItem>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Business name" {...field} data-testid="input-title" />
                    </FormControl>
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
                        placeholder="Describe your business..." 
                        {...field} 
                        rows={4}
                        data-testid="input-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone *</FormLabel>
                      <FormControl>
                        <Input placeholder="+852 1234 5678" {...field} data-testid="input-phone" />
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
                        <Input type="email" placeholder="contact@business.com" {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} value={field.value || ""} data-testid="input-website" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Images (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter image URLs, one per line&#10;https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                        value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                        onChange={(e) => {
                          const urls = e.target.value.split('\n').map(url => url.trim()).filter(url => url.length > 0);
                          field.onChange(urls.length > 0 ? urls : undefined);
                        }}
                        rows={4}
                        data-testid="input-images"
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      First image will be shown in the hero section
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isOnlineOnly"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-online-only"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Online Only
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Check if this is an online-only business (no physical location)
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {!form.watch("isOnlineOnly") && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="Street address" {...field} data-testid="input-address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input placeholder="Hong Kong" {...field} data-testid="input-city" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="999077" {...field} value={field.value || ""} data-testid="input-postal" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input placeholder="22.3193" {...field} value={field.value || ""} data-testid="input-latitude" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input placeholder="114.1694" {...field} value={field.value || ""} data-testid="input-longitude" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createListingMutation.isPending}
                  data-testid="button-submit-listing"
                >
                  {createListingMutation.isPending ? 'Creating...' : 'Create Listing'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit listing dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Listing</DialogTitle>
            <DialogDescription>
              Update the listing details
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="school">School</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="provision-store">Provision Store</SelectItem>
                          <SelectItem value="masjid">Masjid</SelectItem>
                          <SelectItem value="services-store">Services Store</SelectItem>
                          <SelectItem value="virtual-kitchen">Virtual Kitchen</SelectItem>
                          <SelectItem value="arts-henna">Arts Henna</SelectItem>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Business name" {...field} data-testid="input-edit-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your business..." 
                        {...field} 
                        value={field.value || ""}
                        rows={4}
                        data-testid="input-edit-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone *</FormLabel>
                      <FormControl>
                        <Input placeholder="+852 1234 5678" {...field} value={field.value || ""} data-testid="input-edit-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@business.com" {...field} value={field.value || ""} data-testid="input-edit-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} value={field.value || ""} data-testid="input-edit-website" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Images (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter image URLs, one per line&#10;https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                        value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                        onChange={(e) => {
                          const urls = e.target.value.split('\n').map(url => url.trim()).filter(url => url.length > 0);
                          field.onChange(urls.length > 0 ? urls : undefined);
                        }}
                        rows={4}
                        data-testid="input-edit-images"
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      First image will be shown in the hero section
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address" {...field} value={field.value || ""} data-testid="input-edit-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Hong Kong" {...field} value={field.value || ""} data-testid="input-edit-city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="000000" {...field} value={field.value || ""} data-testid="input-edit-postal" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input placeholder="22.3193" {...field} value={field.value || ""} data-testid="input-edit-latitude" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input placeholder="114.1694" {...field} value={field.value || ""} data-testid="input-edit-longitude" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={editListingMutation.isPending}
                  data-testid="button-submit-edit"
                >
                  {editListingMutation.isPending ? 'Updating...' : 'Update Listing'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Listing</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{listingToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteListingMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteListingMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}