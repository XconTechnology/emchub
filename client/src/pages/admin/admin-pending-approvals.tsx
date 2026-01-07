import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Eye, Package, Store, Briefcase, Calendar, Clock, Coins, MapPin, Users, DollarSign, Edit } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Listing, Coupon } from "@shared/schema";

interface ListingWithUser extends Listing {
  user?: {
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  isEdit?: boolean;
}

export default function AdminPendingApprovals() {
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<ListingWithUser | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("new");

  const { data: pendingItems = [], isLoading } = useQuery<ListingWithUser[]>({
    queryKey: ['/api/admin/pending-approvals'],
  });

  const { data: productCoupon } = useQuery<Coupon | null>({
    queryKey: ['/api/coupons/product', selectedItem?.id],
    enabled: !!selectedItem && selectedItem.type === 'product',
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
      case 'event':
        return <Calendar className="w-4 h-4" />;
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

  const newSubmissions = pendingItems.filter(item => {
    const createdAt = item.createdAt ? new Date(item.createdAt).getTime() : 0;
    const updatedAt = item.updatedAt ? new Date(item.updatedAt).getTime() : 0;
    return Math.abs(updatedAt - createdAt) < 60000;
  });

  const editRequests = pendingItems.filter(item => {
    const createdAt = item.createdAt ? new Date(item.createdAt).getTime() : 0;
    const updatedAt = item.updatedAt ? new Date(item.updatedAt).getTime() : 0;
    return Math.abs(updatedAt - createdAt) >= 60000;
  });

  const renderTable = (items: ListingWithUser[], isEditRequest: boolean = false) => (
    items.length === 0 ? (
      <div className="text-center py-12 text-muted-foreground">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg">No {isEditRequest ? 'edit requests' : 'pending items'} to review</p>
        <p className="text-sm">All submissions have been processed</p>
      </div>
    ) : (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Item Name</TableHead>
            <TableHead>Submitted By</TableHead>
            <TableHead>{isEditRequest ? 'Last Updated' : 'Date Submitted'}</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} data-testid={`pending-item-${item.id}`}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getTypeIcon(item.type)}
                  <Badge variant="outline" className="capitalize">
                    {item.type}
                  </Badge>
                  {isEditRequest && (
                    <Badge variant="secondary" className="text-xs">
                      <Edit className="w-3 h-3 mr-1" />
                      Edited
                    </Badge>
                  )}
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
                {formatDate(isEditRequest ? item.updatedAt : item.createdAt)}
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
    )
  );

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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="new" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                New Submissions
                {newSubmissions.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{newSubmissions.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="edits" className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Requests
                {editRequests.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{editRequests.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="new">
              {renderTable(newSubmissions, false)}
            </TabsContent>
            
            <TabsContent value="edits">
              {renderTable(editRequests, true)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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

              {selectedItem.customCategory && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categories</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {selectedItem.customCategory.split(',').filter(cat => cat.trim()).map((cat, index) => (
                      <Badge key={index} variant="outline">
                        {cat.trim()}
                      </Badge>
                    ))}
                  </div>
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

              {selectedItem.type === 'event' && (
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Event Details
                  </p>
                  <div className="grid grid-cols-2 gap-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                    {selectedItem.eventDate && (
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Event Date</p>
                          <p className="mt-1">{formatDate(selectedItem.eventDate)}</p>
                        </div>
                      </div>
                    )}
                    {selectedItem.eventPrice && (
                      <div className="flex items-start gap-2">
                        <DollarSign className="w-4 h-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Event Price</p>
                          <p className="mt-1 font-semibold">${selectedItem.eventPrice}</p>
                        </div>
                      </div>
                    )}
                    {selectedItem.eventTdPrice && (
                      <div className="flex items-start gap-2">
                        <Coins className="w-4 h-4 text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">TimeDollar Price</p>
                          <p className="mt-1 font-semibold">{selectedItem.eventTdPrice} TD</p>
                        </div>
                      </div>
                    )}
                    {selectedItem.eventHours && (
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-purple-600 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Duration</p>
                          <p className="mt-1">{selectedItem.eventHours} hours</p>
                        </div>
                      </div>
                    )}
                    {selectedItem.capacity && (
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-indigo-600 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Capacity</p>
                          <p className="mt-1">{selectedItem.capacity} attendees</p>
                        </div>
                      </div>
                    )}
                    {selectedItem.paymentType && (
                      <div className="flex items-start gap-2">
                        <DollarSign className="w-4 h-4 text-teal-600 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Payment Type</p>
                          <p className="mt-1 capitalize">{selectedItem.paymentType.replace('_', ' ')}</p>
                        </div>
                      </div>
                    )}
                    {selectedItem.address && (
                      <div className="flex items-start gap-2 col-span-2">
                        <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Location</p>
                          <p className="mt-1">{selectedItem.address}</p>
                        </div>
                      </div>
                    )}
                    {selectedItem.isOnlineOnly && (
                      <div className="col-span-2">
                        <Badge variant="secondary">Online Event</Badge>
                        {selectedItem.website && (
                          <a href={selectedItem.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2 text-sm">
                            {selectedItem.website}
                          </a>
                        )}
                      </div>
                    )}
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

              {selectedItem.type === 'product' && productCoupon && (
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-3">📣 Product Coupon</p>
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Coupon Code</p>
                        <p className="mt-1 font-mono font-bold text-blue-700 dark:text-blue-400">{productCoupon.code}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Status</p>
                        <Badge variant="secondary" className="mt-1 capitalize">
                          {productCoupon.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Title</p>
                      <p className="mt-1">{productCoupon.title}</p>
                    </div>
                    {productCoupon.description && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Description</p>
                        <p className="mt-1 text-sm">{productCoupon.description}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Discount Type</p>
                        <p className="mt-1 capitalize">{productCoupon.discountType}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Discount Value</p>
                        <p className="mt-1 font-semibold">
                          {productCoupon.discountType === 'percentage' ? `${productCoupon.discountValue}%` : `$${productCoupon.discountValue}`}
                        </p>
                      </div>
                    </div>
                    {productCoupon.usageLimit && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Usage Limit</p>
                        <p className="mt-1">{productCoupon.usageLimit} times</p>
                      </div>
                    )}
                    {productCoupon.validUntil && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Valid Until</p>
                        <p className="mt-1">{formatDate(productCoupon.validUntil)}</p>
                      </div>
                    )}
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      ℹ️ This coupon will be automatically approved when you approve the product
                    </p>
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

              {(selectedItem.address || selectedItem.city) && selectedItem.type !== 'event' && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="mt-1">{selectedItem.address}{selectedItem.city ? `, ${selectedItem.city}` : ''}</p>
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
