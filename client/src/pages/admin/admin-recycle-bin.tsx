import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RotateCcw, Trash2, Calendar } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Listing, Category } from "@shared/schema";

export default function AdminRecycleBin() {
  const { toast } = useToast();
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);

  const { data: deletedListings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ['/api/admin/listings', 'deleted'],
    queryFn: () => fetch('/api/admin/listings/deleted', { credentials: 'include' }).then(res => res.json()),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

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
      setPermanentDeleteDialogOpen(false);
      setListingToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to permanently delete listing. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handlePermanentDelete = (listing: Listing) => {
    setListingToDelete(listing);
    setPermanentDeleteDialogOpen(true);
  };

  const confirmPermanentDelete = () => {
    if (listingToDelete) {
      permanentDeleteMutation.mutate(listingToDelete.id);
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

  if (isLoading) {
    return <div className="text-center py-8">Loading deleted listings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recycle Bin</h2>
        <p className="text-muted-foreground mt-1">
          Restore or permanently delete listings
        </p>
      </div>

      {deletedListings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No deleted listings</p>
          </CardContent>
        </Card>
      ) : (
        deletedListings.map((listing) => {
          const listingCategory = categories.find(cat => cat.id === listing.categoryId);
          return (
            <Card key={listing.id} className="mb-4 bg-gray-50 dark:bg-gray-900" data-testid={`deleted-listing-card-${listing.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg text-gray-700 dark:text-gray-300">{listing.title}</CardTitle>
                      <Badge variant="secondary" className="bg-red-100 text-red-800" data-testid={`status-deleted-${listing.id}`}>
                        Deleted
                      </Badge>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{listing.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Deleted: {formatDate(listing.deletedAt)}
                      </span>
                      <Badge variant="outline">{listingCategory?.name || 'Uncategorized'}</Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2 flex-wrap ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => restoreListingMutation.mutate(listing.id)}
                      disabled={restoreListingMutation.isPending}
                      data-testid={`button-restore-${listing.id}`}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Restore
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handlePermanentDelete(listing)}
                      data-testid={`button-permanent-delete-${listing.id}`}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete Permanently
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })
      )}

      <Dialog open={permanentDeleteDialogOpen} onOpenChange={setPermanentDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permanently Delete Listing</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete "{listingToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermanentDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmPermanentDelete}
              disabled={permanentDeleteMutation.isPending}
              data-testid="button-confirm-permanent-delete"
            >
              {permanentDeleteMutation.isPending ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
