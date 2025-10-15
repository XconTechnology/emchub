import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { RotateCcw, Trash2, MapPin, Clock } from "lucide-react";
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
import { format } from "date-fns";

export default function UserRecycleBin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [restoringListing, setRestoringListing] = useState<Listing | null>(null);
  const [permanentlyDeletingListing, setPermanentlyDeletingListing] = useState<Listing | null>(null);

  const { data: deletedListings, isLoading } = useQuery<Listing[]>({
    queryKey: ['/api/listings/user/deleted'],
    enabled: !!user,
  });

  const restoreListingMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('POST', `/api/listings/${id}/restore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings/user/deleted'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings/user'] });
      toast({ title: "Listing restored successfully" });
      setRestoringListing(null);
    },
    onError: () => {
      toast({ title: "Failed to restore listing", variant: "destructive" });
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/listings/${id}/permanent`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings/user/deleted'] });
      toast({ title: "Listing permanently deleted" });
      setPermanentlyDeletingListing(null);
    },
    onError: () => {
      toast({ title: "Failed to delete listing", variant: "destructive" });
    },
  });

  const renderListingCard = (listing: Listing) => (
    <Card key={listing.id} className="hover:shadow-lg transition-shadow" data-testid={`card-deleted-listing-${listing.id}`}>
      {listing.images && listing.images.length > 0 && (
        <img 
          src={listing.images[0]} 
          alt={listing.title} 
          className="w-full h-48 object-cover rounded-t-lg opacity-60" 
          data-testid={`img-deleted-listing-${listing.id}`}
        />
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg text-gray-600 dark:text-gray-400" data-testid={`text-title-${listing.id}`}>
              {listing.title}
            </CardTitle>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200" data-testid={`badge-deleted-${listing.id}`}>
                Deleted
              </Badge>
              {listing.deletedAt && (
                <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200" data-testid={`badge-deleted-at-${listing.id}`}>
                  <Clock className="w-3 h-3 mr-1" />
                  {format(new Date(listing.deletedAt), 'MMM d, yyyy')}
                </Badge>
              )}
              <Badge 
                variant={listing.type === 'product' ? 'default' : listing.type === 'service' ? 'secondary' : 'outline'}
                data-testid={`badge-type-${listing.id}`}
              >
                {listing.type}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setRestoringListing(listing)}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              data-testid={`button-restore-${listing.id}`}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setPermanentlyDeletingListing(listing)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              data-testid={`button-permanent-delete-${listing.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {listing.description && (
          <p className="text-sm text-gray-500 dark:text-gray-500 line-clamp-2" data-testid={`text-description-${listing.id}`}>
            {listing.description}
          </p>
        )}
        
        {listing.address && (
          <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-500">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1" data-testid={`text-address-${listing.id}`}>{listing.address}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Recycle Bin</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" data-testid="heading-recycle-bin">Recycle Bin</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2" data-testid="text-description">
          Deleted items are stored here. You can restore them or permanently delete them.
        </p>
      </div>

      {!deletedListings || deletedListings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Trash2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400" data-testid="text-empty">
              Your recycle bin is empty
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deletedListings.map(renderListingCard)}
        </div>
      )}

      <AlertDialog open={!!restoringListing} onOpenChange={(open) => !open && setRestoringListing(null)}>
        <AlertDialogContent data-testid="dialog-restore-listing">
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore "{restoringListing?.title}"? It will be moved back to your listings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-restore">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => restoringListing && restoreListingMutation.mutate(restoringListing.id)}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-confirm-restore"
            >
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!permanentlyDeletingListing} onOpenChange={(open) => !open && setPermanentlyDeletingListing(null)}>
        <AlertDialogContent data-testid="dialog-permanent-delete">
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "{permanentlyDeletingListing?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-permanent-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => permanentlyDeletingListing && permanentDeleteMutation.mutate(permanentlyDeletingListing.id)}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-permanent-delete"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
