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
  Trash,
  Download,
  Upload
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
import DashboardLayout from "@/components/DashboardLayout";
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
      status: "draft",
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
      status: "published",
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

  // Fetch deleted listings (recycle bin)
  const { data: deletedListings = [], isLoading: isDeletedLoading } = useQuery<Listing[]>({
    queryKey: ['/api/admin/listings', 'deleted'],
    queryFn: () => fetch('/api/admin/listings/deleted', { credentials: 'include' }).then(res => res.json()),
    enabled: isAdminAuthenticated,
  });

  // Fetch all users
  const { data: users = [], isLoading: isUsersLoading } = useQuery<UserType[]>({
    queryKey: ['/api/admin/users'],
    enabled: isAdminAuthenticated,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Create listing mutation
  const createListingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertListingSchema>) => {
      // Clean up the data - convert empty strings to undefined for optional fields
      const cleanedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === '' ? undefined : value
        ])
      );
      return apiRequest('POST', '/api/listings', cleanedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      toast({
        title: "Listing Created",
        description: "The new listing has been created successfully and is now live on the site.",
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

  // Delete listing mutation (soft delete)
  const deleteListingMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/listings/${id}/soft-delete`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete listing');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      toast({
        title: "Listing Moved to Recycle Bin",
        description: "The listing has been moved to recycle bin and can be restored.",
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
  
  // Restore listing mutation
  const restoreListingMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/listings/${id}/restore`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to restore listing');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      toast({
        title: "Listing Restored",
        description: "The listing has been restored successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to restore listing. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Permanently delete listing mutation
  const permanentDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/listings/${id}/permanent`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to permanently delete listing');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      toast({
        title: "Listing Permanently Deleted",
        description: "The listing has been permanently deleted and cannot be recovered.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to permanently delete listing. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Update listing status mutation (draft/published)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/admin/listings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      toast({
        title: "Status Updated",
        description: `Listing ${variables.status === 'published' ? 'published' : 'saved as draft'} successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Export listings to Excel
  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/listings/export', {
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to export listings');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `listings-export-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Successful",
        description: "Listings have been exported to Excel.",
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export listings. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Import listings from Excel
  const importMutation = useMutation({
    mutationFn: async (fileData: string) => {
      const response = await fetch('/api/admin/listings/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fileData }),
      });
      if (!response.ok) throw new Error('Failed to import listings');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      toast({
        title: "Import Completed",
        description: `Successfully imported ${data.importedCount} listing(s). Skipped ${data.skippedCount} duplicate(s). ${data.errorCount} error(s).`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import listings. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result?.toString().split(',')[1];
        if (base64) {
          importMutation.mutate(base64);
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

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
      status: (listing.status === 'draft' || listing.status === 'published') ? listing.status : "published",
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

  const ListingCard = ({ listing }: { listing: Listing }) => {
    const listingCategory = categories.find(cat => cat.id === listing.categoryId);
    return (
      <Card className="mb-4" data-testid={`listing-card-${listing.id}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg">{listing.title}</CardTitle>
                {listing.status === 'draft' ? (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800" data-testid={`status-draft-${listing.id}`}>Draft</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800" data-testid={`status-published-${listing.id}`}>Published</Badge>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-2">{listing.description}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(listing.createdAt)}
                </span>
                <Badge variant="outline">{listingCategory?.name || 'Uncategorized'}</Badge>
              </div>
            </div>
            <div className="flex space-x-2 flex-wrap ml-4">
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
              {listing.status === 'draft' ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => updateStatusMutation.mutate({ id: listing.id, status: 'published' })}
                  disabled={updateStatusMutation.isPending}
                  data-testid={`button-publish-${listing.id}`}
                >
                  Publish
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatusMutation.mutate({ id: listing.id, status: 'draft' })}
                  disabled={updateStatusMutation.isPending}
                  data-testid={`button-draft-${listing.id}`}
                >
                  Move to Draft
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  };

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
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <Card className="wp-card mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h2>
                <p className="text-gray-600 dark:text-gray-300">Manage listings and monitor users</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleExport}
                  data-testid="button-export"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleImport}
                  disabled={importMutation.isPending}
                  data-testid="button-import"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {importMutation.isPending ? 'Importing...' : 'Import'}
                </Button>
                <Button 
                  variant="default" 
                  onClick={() => setCreateDialogOpen(true)}
                  data-testid="button-add-listing"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Listing
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" data-testid="tab-all">
            All Listings ({allListings.length})
          </TabsTrigger>
          <TabsTrigger value="draft" data-testid="tab-draft">
            Draft Listings ({allListings.filter(l => l.status === 'draft').length})
          </TabsTrigger>
          <TabsTrigger value="published" data-testid="tab-published">
            Published Listings ({allListings.filter(l => l.status === 'published').length})
          </TabsTrigger>
          <TabsTrigger value="recycle" data-testid="tab-recycle">
            Recycle Bin ({deletedListings.length})
          </TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">
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

        <TabsContent value="draft" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Draft Listings</h2>
            {isAllLoading ? (
              <div>Loading draft listings...</div>
            ) : allListings.filter(l => l.status === 'draft').length === 0 ? (
              <p className="text-gray-500">No draft listings found</p>
            ) : (
              allListings.filter(l => l.status === 'draft').map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="published" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Published Listings</h2>
            {isAllLoading ? (
              <div>Loading published listings...</div>
            ) : allListings.filter(l => l.status === 'published').length === 0 ? (
              <p className="text-gray-500">No published listings found</p>
            ) : (
              allListings.filter(l => l.status === 'published').map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="recycle" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recycle Bin</h2>
            {isDeletedLoading ? (
              <div>Loading deleted listings...</div>
            ) : deletedListings.length === 0 ? (
              <p className="text-gray-500">No deleted listings found</p>
            ) : (
              deletedListings.map((listing) => {
                const listingCategory = categories.find(cat => cat.id === listing.categoryId);
                return (
                  <Card key={listing.id} className="mb-4" data-testid={`listing-card-${listing.id}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{listing.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{listingCategory?.name || 'Uncategorized'}</Badge>
                            <Badge variant="secondary" className="bg-red-100 text-red-800">Deleted</Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => restoreListingMutation.mutate(listing.id)}
                            disabled={restoreListingMutation.isPending}
                            data-testid={`button-restore-${listing.id}`}
                          >
                            Restore
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to permanently delete this listing? This cannot be undone.')) {
                                permanentDeleteMutation.mutate(listing.id);
                              }
                            }}
                            disabled={permanentDeleteMutation.isPending}
                            data-testid={`button-permanent-delete-${listing.id}`}
                          >
                            Delete Permanently
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-2">{listing.description}</p>
                    </CardContent>
                  </Card>
                );
              })
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
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
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
                    <FormLabel>Title</FormLabel>
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
                    <FormLabel>Description</FormLabel>
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
                      <FormLabel>Phone</FormLabel>
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
                      <FormLabel>Email</FormLabel>
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
                          <FormLabel>Address</FormLabel>
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
                          <FormLabel>City</FormLabel>
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

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publish Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft (not visible to public)</SelectItem>
                        <SelectItem value="published">Published (visible to public)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Draft listings are only visible in the admin dashboard
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
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
                    <FormLabel>Title</FormLabel>
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
                    <FormLabel>Description</FormLabel>
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
                      <FormLabel>Phone</FormLabel>
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
                      <FormLabel>Email</FormLabel>
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

              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publish Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft (not visible to public)</SelectItem>
                        <SelectItem value="published">Published (visible to public)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Draft listings are only visible in the admin dashboard
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
    </DashboardLayout>
  );
}