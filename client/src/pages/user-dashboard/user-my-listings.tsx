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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8FC24C]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Store className="w-6 h-6" />
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

      {/* Listings Grid */}
      {listings.length === 0 ? (
        <Card className="p-12 text-center">
          <Store className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first business listing to get started
          </p>
          <Button
            onClick={() => setLocation("/dashboard/create-listing")}
            style={{ backgroundColor: '#8FC24C' }}
            data-testid="button-create-first-listing"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Listing
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
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
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2" data-testid={`text-description-${listing.id}`}>
                  {listing.description}
                </p>
                
                {listing.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1" data-testid={`text-address-${listing.id}`}>{listing.address}</span>
                  </div>
                )}
                
                {listing.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span data-testid={`text-phone-${listing.id}`}>{listing.phone}</span>
                  </div>
                )}
                
                {listing.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span data-testid={`text-email-${listing.id}`}>{listing.email}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setLocation(`/edit-listing/${listing.id}`)}
                    data-testid={`button-edit-${listing.id}`}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setDeletingListing(listing)}
                    data-testid={`button-delete-${listing.id}`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
