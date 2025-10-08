import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Eye, Package, Store, Briefcase } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Listing } from "@shared/schema";

interface ListingWithUser extends Listing {
  user?: {
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

export default function AdminPendingApprovals() {
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<ListingWithUser | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const { data: pendingItems = [], isLoading } = useQuery<ListingWithUser[]>({
    queryKey: ['/api/admin/pending-approvals'],
  });

  const acceptMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await apiRequest("PATCH", `/api/admin/listings/${itemId}/approve`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      toast({ title: "Item approved and published!" });
    },
    onError: () => {
      toast({ title: "Failed to approve item", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await apiRequest("PATCH", `/api/admin/listings/${itemId}/reject`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-approvals'] });
      toast({ title: "Item rejected" });
    },
    onError: () => {
      toast({ title: "Failed to reject item", variant: "destructive" });
    },
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Package className="w-4 h-4" />;
      case 'service':
        return <Briefcase className="w-4 h-4" />;
      default:
        return <Store className="w-4 h-4" />;
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

  const handleView = (item: ListingWithUser) => {
    setSelectedItem(item);
    setViewDialogOpen(true);
  };

  const handleAccept = (itemId: string) => {
    acceptMutation.mutate(itemId);
  };

  const handleReject = (itemId: string) => {
    rejectMutation.mutate(itemId);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading pending approvals...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Pending Approvals</CardTitle>
          <p className="text-muted-foreground">Review and approve user submissions</p>
        </CardHeader>
        <CardContent>
          {pendingItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No pending items to review</p>
              <p className="text-sm">All submissions have been processed</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Date Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingItems.map((item) => (
                  <TableRow key={item.id} data-testid={`pending-item-${item.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <Badge variant="outline" className="capitalize">
                          {item.type}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium" data-testid={`item-title-${item.id}`}>
                      {item.title}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium" data-testid={`item-user-${item.id}`}>
                          {item.user?.firstName && item.user?.lastName
                            ? `${item.user.firstName} ${item.user.lastName}`
                            : item.user?.username || 'Unknown'}
                        </p>
                        <p className="text-sm text-muted-foreground">{item.user?.email || 'N/A'}</p>
                      </div>
                    </TableCell>
                    <TableCell data-testid={`item-date-${item.id}`}>
                      {formatDate(item.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(item)}
                          data-testid={`button-view-${item.id}`}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleAccept(item.id)}
                          disabled={acceptMutation.isPending}
                          data-testid={`button-accept-${item.id}`}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(item.id)}
                          disabled={rejectMutation.isPending}
                          data-testid={`button-reject-${item.id}`}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Item Details</DialogTitle>
            <DialogDescription>Review item information before approving or rejecting</DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <Badge variant="outline" className="capitalize mt-1">
                    {selectedItem.type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant="secondary" className="mt-1 capitalize">
                    {selectedItem.status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Title</p>
                <p className="mt-1 text-lg font-semibold">{selectedItem.title}</p>
              </div>

              {selectedItem.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="mt-1">{selectedItem.description}</p>
                </div>
              )}

              {selectedItem.images && selectedItem.images.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Images</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedItem.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${selectedItem.title} ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedItem.type === 'product' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Price</p>
                    <p className="mt-1 text-lg font-semibold">${selectedItem.price}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Stock</p>
                    <p className="mt-1">{selectedItem.inventory || 0} units</p>
                  </div>
                </div>
              )}

              {selectedItem.type === 'service' && selectedItem.price && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Price</p>
                    <p className="mt-1 text-lg font-semibold">${selectedItem.price}</p>
                  </div>
                  {selectedItem.duration && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Duration</p>
                      <p className="mt-1">{selectedItem.duration} minutes</p>
                    </div>
                  )}
                </div>
              )}

              {(selectedItem.address || selectedItem.city) && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="mt-1">{selectedItem.address}, {selectedItem.city}</p>
                </div>
              )}

              {selectedItem.phone && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact</p>
                  <p className="mt-1">{selectedItem.phone}</p>
                  {selectedItem.email && <p>{selectedItem.email}</p>}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="default"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    handleAccept(selectedItem.id);
                    setViewDialogOpen(false);
                  }}
                  disabled={acceptMutation.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept & Publish
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    handleReject(selectedItem.id);
                    setViewDialogOpen(false);
                  }}
                  disabled={rejectMutation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
