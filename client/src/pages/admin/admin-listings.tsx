import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Edit, Trash, Calendar } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Listing, Category } from "@shared/schema";

export default function AdminListings() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);

  const { data: allListings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ['/api/admin/listings', 'all'],
    queryFn: () => fetch('/api/admin/listings', { credentials: 'include' }).then(res => res.json()),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

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

  const handleDelete = (listing: Listing) => {
    setListingToDelete(listing);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (listingToDelete) {
      deleteListingMutation.mutate(listingToDelete.id);
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

  const draftListings = allListings.filter(listing => listing.status === 'draft');
  const publishedListings = allListings.filter(listing => listing.status === 'published');

  const renderListingCard = (listing: Listing) => {
    const listingCategory = categories.find(cat => cat.id === listing.categoryId);
    return (
      <Card key={listing.id} className="mb-4" data-testid={`listing-card-${listing.id}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg">{listing.title}</CardTitle>
                {listing.status === 'draft' ? (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" data-testid={`status-draft-${listing.id}`}>Draft</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" data-testid={`status-published-${listing.id}`}>Published</Badge>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{listing.description}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(listing.createdAt)}
                </span>
                <Badge variant="outline">{listingCategory?.name || 'Uncategorized'}</Badge>
              </div>
            </div>
            <div className="flex space-x-2 flex-wrap ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation(`/business/${listing.id}`)}
                data-testid={`button-view-${listing.id}`}
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation(`/admin/listings/edit/${listing.id}`)}
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

  if (isLoading) {
    return <div className="text-center py-8">Loading listings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Listings</h2>
          <p className="text-muted-foreground mt-1">
            Manage all listings across your platform
          </p>
        </div>
        <Button 
          onClick={() => setLocation('/admin/listings/new')}
          data-testid="button-add-listing"
        >
          Add New Listing
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-listings">
            All Listings ({allListings.length})
          </TabsTrigger>
          <TabsTrigger value="published" data-testid="tab-published-listings">
            Published ({publishedListings.length})
          </TabsTrigger>
          <TabsTrigger value="draft" data-testid="tab-draft-listings">
            Draft ({draftListings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {allListings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No listings found</p>
              </CardContent>
            </Card>
          ) : (
            allListings.map(renderListingCard)
          )}
        </TabsContent>

        <TabsContent value="published" className="mt-6">
          {publishedListings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No published listings found</p>
              </CardContent>
            </Card>
          ) : (
            publishedListings.map(renderListingCard)
          )}
        </TabsContent>

        <TabsContent value="draft" className="mt-6">
          {draftListings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No draft listings found</p>
              </CardContent>
            </Card>
          ) : (
            draftListings.map(renderListingCard)
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Listing</DialogTitle>
            <DialogDescription>
              Are you sure you want to move "{listingToDelete?.title}" to the recycle bin? You can restore it later.
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
