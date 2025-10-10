import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Store, Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Listing } from "@shared/schema";
import AddListingModal from "@/components/AddListingModal";
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

export default function UserMyListings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingListing, setDeletingListing] = useState<Listing | null>(null);

  const { data: userListings, isLoading } = useQuery<Listing[]>({
    queryKey: ['/api/listings/user'],
    enabled: !!user,
  });

  const deleteListingMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/api/listings/${id}`, 'DELETE');
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

  const renderListingCard = (listing: Listing) => (
    <Card key={listing.id} className="hover:shadow-lg transition-shadow" data-testid={`card-listing-${listing.id}`}>
      {listing.images && listing.images.length > 0 && (
        <img src={listing.images[0]} alt={listing.title} className="w-full h-48 object-cover rounded-t-lg" />
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{listing.title}</CardTitle>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant={listing.status === 'published' ? 'default' : listing.status === 'pending' ? 'secondary' : 'destructive'}>
                {listing.status}
              </Badge>
              {listing.price && (
                <Badge variant="outline" className="font-semibold">
                  ${parseFloat(listing.price.toString()).toFixed(2)}
                </Badge>
              )}
              {listing.customCategory && listing.customCategory.split(',').filter(cat => cat.trim()).map((cat, index) => (
                <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {cat.trim()}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" data-testid={`button-edit-${listing.id}`}>
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
      <CardContent>
        {listing.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{listing.description}</p>
        )}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {listing.city && (
              <span className="text-gray-600">{listing.city}</span>
            )}
            {listing.paymentType && (
              <span className="text-gray-600 capitalize">
                {listing.paymentType.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (user?.vendorStatus !== 'verified') {
    return (
      <div className="text-center py-12">
        <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Vendor Verification Required</h2>
        <p className="text-gray-600 mb-4">You need to be a verified vendor to access this section.</p>
        <Button onClick={() => window.location.href = '/profile'}>
          Become a Vendor
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Listings</h2>
          <p className="text-gray-600">Manage your business listings</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} data-testid="button-add-listing">
          <Plus className="w-4 h-4 mr-2" />
          Add New Listing
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{listings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {listings.filter(l => l.status === 'published').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {listings.filter(l => l.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading listings...</p>
        </div>
      ) : listings.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map(renderListingCard)}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No listings yet</p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Listing
            </Button>
          </CardContent>
        </Card>
      )}

      <AddListingModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

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
