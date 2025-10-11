import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Store, Edit, Trash2, Plus, MapPin, Phone, Mail } from "lucide-react";
import { useLocation } from "wouter";
import type { Listing } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useState } from "react";

export default function UserMyListings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [deletingListing, setDeletingListing] = useState<Listing | null>(null);
  const [activeTab, setActiveTab] = useState("published");

  const { data: userListings, isLoading } = useQuery<Listing[]>({
    queryKey: ['/api/listings/user'],
    enabled: !!user,
  });

  const deleteListingMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/listings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings/user'] });
      toast({ title: "Listing deleted successfully" });
      setDeletingListing(null);
    },
    onError: () => {
      toast({ title: "Failed to delete listing", variant: "destructive" });
    },
  });

  const listings = userListings?.filter(item => item.type === 'business') || [];
  
  const approvedListings = listings.filter(l => l.status === 'published');
  const pendingListings = listings.filter(l => l.status === 'pending');
  const rejectedListings = listings.filter(l => l.status === 'rejected');

  const renderListingCard = (listing: Listing) => (
    <Card key={listing.id} className="hover:shadow-lg transition-shadow" data-testid={`card-listing-${listing.id}`}>
      {listing.images && listing.images.length > 0 && (
        <img 
          src={listing.images[0]} 
          alt={listing.title} 
          className="w-full h-48 object-cover rounded-t-lg" 
          data-testid={`img-listing-${listing.id}`}
        />
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg" data-testid={`text-title-${listing.id}`}>
              {listing.title}
            </CardTitle>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge 
                variant={listing.status === 'published' ? 'default' : listing.status === 'pending' ? 'secondary' : 'destructive'}
                data-testid={`badge-status-${listing.id}`}
              >
                {listing.status}
              </Badge>
              {listing.customCategory && listing.customCategory.split(',').filter(cat => cat.trim()).map((cat, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="bg-blue-50 text-blue-700 border-blue-200"
                  data-testid={`badge-category-${listing.id}-${index}`}
                >
                  {cat.trim()}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation(`/dashboard/edit-listing/${listing.id}`)}
              data-testid={`button-edit-${listing.id}`}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setDeletingListing(listing)}
              data-testid={`button-delete-${listing.id}`}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {listing.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2" data-testid={`text-description-${listing.id}`}>
            {listing.description}
          </p>
        )}
        
        {listing.address && (
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1" data-testid={`text-address-${listing.id}`}>{listing.address}</span>
          </div>
        )}
        
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          {listing.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              <span data-testid={`text-phone-${listing.id}`}>{listing.phone}</span>
            </div>
          )}
          {listing.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span data-testid={`text-email-${listing.id}`} className="truncate">{listing.email}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            My Business Listings
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your business listings and their visibility
          </p>
        </div>
        <Button
          onClick={() => setLocation("/dashboard/create-listing")}
          className="gap-2"
          style={{ backgroundColor: '#8FC24C' }}
          data-testid="button-create-listing"
        >
          <Plus className="w-4 h-4" />
          Add New Listing
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Approved Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {approvedListings.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingListings.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {rejectedListings.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="published" data-testid="tab-approved">
            Approved ({approvedListings.length})
          </TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">
            Pending ({pendingListings.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" data-testid="tab-rejected">
            Rejected ({rejectedListings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="published" className="mt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading listings...</p>
            </div>
          ) : approvedListings.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {approvedListings.map(renderListingCard)}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No approved listings yet</p>
                <Button
                  onClick={() => setLocation("/dashboard/create-listing")}
                  style={{ backgroundColor: '#8FC24C' }}
                  data-testid="button-create-first-listing"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Listing
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading listings...</p>
            </div>
          ) : pendingListings.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendingListings.map(renderListingCard)}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No pending listings</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading listings...</p>
            </div>
          ) : rejectedListings.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rejectedListings.map(renderListingCard)}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No rejected listings</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingListing} onOpenChange={() => setDeletingListing(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingListing?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingListing && deleteListingMutation.mutate(deletingListing.id)}
              className="bg-red-600 hover:bg-red-700"
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
