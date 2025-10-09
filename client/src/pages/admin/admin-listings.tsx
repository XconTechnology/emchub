import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Edit, Trash, Calendar, Download, Upload, CheckSquare, Search } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Listing, Category } from "@shared/schema";

export default function AdminListings() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);
  const [selectedListings, setSelectedListings] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

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

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return apiRequest('POST', '/api/admin/listings/bulk-delete', { ids });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      setSelectedListings(new Set());
      toast({
        title: "Listings Deleted",
        description: `${data.count} listing(s) moved to recycle bin.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete listings.",
        variant: "destructive",
      });
    }
  });

  const bulkPublishMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return apiRequest('POST', '/api/admin/listings/bulk-publish', { ids });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      setSelectedListings(new Set());
      toast({
        title: "Listings Published",
        description: `${data.count} listing(s) published successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to publish listings.",
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

  // Filter listings by search term
  const filteredListings = allListings.filter(listing => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      listing.title?.toLowerCase().includes(searchLower) ||
      listing.description?.toLowerCase().includes(searchLower) ||
      listing.address?.toLowerCase().includes(searchLower) ||
      listing.city?.toLowerCase().includes(searchLower) ||
      listing.phone?.toLowerCase().includes(searchLower) ||
      listing.email?.toLowerCase().includes(searchLower)
    );
  });

  const draftListings = filteredListings.filter(listing => listing.status === 'draft');
  const publishedListings = filteredListings.filter(listing => listing.status === 'published');
  const acceptedProducts = filteredListings.filter(listing => listing.type === 'product' && listing.status === 'published');

  const toggleListingSelection = (id: string) => {
    const newSelected = new Set(selectedListings);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedListings(newSelected);
  };

  const toggleSelectAll = (listings: Listing[]) => {
    if (selectedListings.size === listings.length && listings.length > 0) {
      setSelectedListings(new Set());
    } else {
      setSelectedListings(new Set(listings.map(l => l.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedListings.size === 0) return;
    bulkDeleteMutation.mutate(Array.from(selectedListings));
  };

  const handleBulkPublish = () => {
    if (selectedListings.size === 0) return;
    bulkPublishMutation.mutate(Array.from(selectedListings));
  };

  const renderListingCard = (listing: Listing) => {
    const listingCategory = categories.find(cat => cat.id === listing.categoryId);
    const isSelected = selectedListings.has(listing.id);
    
    return (
      <Card key={listing.id} className="mb-4" data-testid={`listing-card-${listing.id}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3 flex-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleListingSelection(listing.id)}
                data-testid={`checkbox-listing-${listing.id}`}
              />
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
            onClick={() => setLocation('/admin/listings/new')}
            data-testid="button-add-listing"
          >
            Add New Listing
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search listings by title, description, address, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full"
          data-testid="input-search-listings"
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-listings">
            All Listings ({filteredListings.length})
          </TabsTrigger>
          <TabsTrigger value="accepted" data-testid="tab-accepted-products">
            Accepted Products ({acceptedProducts.length})
          </TabsTrigger>
          <TabsTrigger value="published" data-testid="tab-published-listings">
            Published ({publishedListings.length})
          </TabsTrigger>
          <TabsTrigger value="draft" data-testid="tab-draft-listings">
            Draft ({draftListings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {filteredListings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {searchTerm ? `No listings found matching "${searchTerm}"` : "No listings found"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedListings.size === filteredListings.length && filteredListings.length > 0}
                    onCheckedChange={() => toggleSelectAll(filteredListings)}
                    data-testid="checkbox-select-all-listings"
                  />
                  <span className="text-sm font-medium">
                    {selectedListings.size > 0 ? `${selectedListings.size} selected` : 'Select All'}
                  </span>
                </div>
                {selectedListings.size > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkPublish}
                      disabled={bulkPublishMutation.isPending}
                      data-testid="button-bulk-publish"
                    >
                      <CheckSquare className="w-4 h-4 mr-2" />
                      Publish Selected
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={bulkDeleteMutation.isPending}
                      data-testid="button-bulk-delete"
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete Selected
                    </Button>
                  </div>
                )}
              </div>
              {filteredListings.map(renderListingCard)}
            </>
          )}
        </TabsContent>

        <TabsContent value="accepted" className="mt-6">
          {acceptedProducts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {searchTerm ? `No accepted products found matching "${searchTerm}"` : "No accepted products found"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedListings.size === acceptedProducts.length && acceptedProducts.length > 0}
                    onCheckedChange={() => toggleSelectAll(acceptedProducts)}
                    data-testid="checkbox-select-all-accepted"
                  />
                  <span className="text-sm font-medium">
                    {selectedListings.size > 0 ? `${selectedListings.size} selected` : 'Select All'}
                  </span>
                </div>
                {selectedListings.size > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={bulkDeleteMutation.isPending}
                      data-testid="button-bulk-delete-accepted"
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete Selected
                    </Button>
                  </div>
                )}
              </div>
              {acceptedProducts.map(renderListingCard)}
            </>
          )}
        </TabsContent>

        <TabsContent value="published" className="mt-6">
          {publishedListings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {searchTerm ? `No published listings found matching "${searchTerm}"` : "No published listings found"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedListings.size === publishedListings.length && publishedListings.length > 0}
                    onCheckedChange={() => toggleSelectAll(publishedListings)}
                    data-testid="checkbox-select-all-published"
                  />
                  <span className="text-sm font-medium">
                    {selectedListings.size > 0 ? `${selectedListings.size} selected` : 'Select All'}
                  </span>
                </div>
                {selectedListings.size > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={bulkDeleteMutation.isPending}
                      data-testid="button-bulk-delete-published"
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete Selected
                    </Button>
                  </div>
                )}
              </div>
              {publishedListings.map(renderListingCard)}
            </>
          )}
        </TabsContent>

        <TabsContent value="draft" className="mt-6">
          {draftListings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {searchTerm ? `No draft listings found matching "${searchTerm}"` : "No draft listings found"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedListings.size === draftListings.length && draftListings.length > 0}
                    onCheckedChange={() => toggleSelectAll(draftListings)}
                    data-testid="checkbox-select-all-draft"
                  />
                  <span className="text-sm font-medium">
                    {selectedListings.size > 0 ? `${selectedListings.size} selected` : 'Select All'}
                  </span>
                </div>
                {selectedListings.size > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkPublish}
                      disabled={bulkPublishMutation.isPending}
                      data-testid="button-bulk-publish-draft"
                    >
                      <CheckSquare className="w-4 h-4 mr-2" />
                      Publish Selected
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={bulkDeleteMutation.isPending}
                      data-testid="button-bulk-delete-draft"
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete Selected
                    </Button>
                  </div>
                )}
              </div>
              {draftListings.map(renderListingCard)}
            </>
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
