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
        <DialogContent className="max-w-lg">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2">
              {selectedItem?.isEdit ? <Edit className="w-4 h-4" /> : getTypeIcon(selectedItem?.type || '')}
              {selectedItem?.isEdit ? 'Edit Request' : 'New Submission'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {selectedItem?.isEdit ? 'Review changes made by vendor' : 'Review before approving'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-3">
              {/* Header info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize text-xs">{selectedItem.type}</Badge>
                  <span className="text-sm font-medium">{selectedItem.title}</span>
                </div>
                <Badge variant="secondary" className="capitalize text-xs">{selectedItem.status}</Badge>
              </div>

              {/* For edit requests: Show only what changed */}
              {selectedItem.isEdit && selectedItem.previousValues && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1">
                    <Edit className="w-3 h-3" /> Changes Made
                  </p>
                  <div className="space-y-2 text-xs">
                    {(() => {
                      const prev = selectedItem.previousValues as Record<string, any>;
                      const changes: { field: string; from: any; to: any }[] = [];
                      
                      const fieldLabels: Record<string, string> = {
                        title: 'Title',
                        description: 'Description',
                        eventDate: 'Event Date',
                        eventPrice: 'Price (HKD)',
                        eventTdPrice: 'TD Price',
                        eventHours: 'Duration (hrs)',
                        capacity: 'Capacity',
                        address: 'Location',
                        website: 'Website',
                        paymentType: 'Payment Type',
                        price: 'Price',
                        inventory: 'Stock',
                      };
                      
                      Object.keys(fieldLabels).forEach(key => {
                        const prevVal = prev[key];
                        const newVal = (selectedItem as any)[key];
                        if (prevVal !== newVal && (prevVal || newVal)) {
                          changes.push({ field: fieldLabels[key], from: prevVal, to: newVal });
                        }
                      });
                      
                      return changes.length > 0 ? changes.map((change, idx) => (
                        <div key={idx} className="flex items-start gap-2 py-1 border-b border-amber-200/50 last:border-0">
                          <span className="font-medium text-amber-800 dark:text-amber-300 w-24 shrink-0">{change.field}:</span>
                          <span className="text-red-600 dark:text-red-400 line-through">{String(change.from) || '(empty)'}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-green-600 dark:text-green-400 font-medium">{String(change.to) || '(empty)'}</span>
                        </div>
                      )) : (
                        <p className="text-muted-foreground">No field changes detected</p>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* For new submissions: Show compact summary */}
              {!selectedItem.isEdit && (
                <>
                  {selectedItem.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{selectedItem.description}</p>
                  )}
                  
                  {selectedItem.images && selectedItem.images.length > 0 && (
                    <div className="flex gap-1">
                      {selectedItem.images.slice(0, 3).map((img, idx) => (
                        <img key={idx} src={img} alt="" className="w-16 h-16 object-cover rounded" />
                      ))}
                    </div>
                  )}

                  {selectedItem.type === 'event' && (
                    <div className="grid grid-cols-2 gap-2 text-xs bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2">
                      {selectedItem.eventDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-blue-600" />
                          <span>{formatDate(selectedItem.eventDate)}</span>
                        </div>
                      )}
                      {selectedItem.eventPrice && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-green-600" />
                          <span>${selectedItem.eventPrice}</span>
                        </div>
                      )}
                      {selectedItem.eventTdPrice && (
                        <div className="flex items-center gap-1">
                          <Coins className="w-3 h-3 text-amber-500" />
                          <span>{selectedItem.eventTdPrice} TD</span>
                        </div>
                      )}
                      {selectedItem.eventHours && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-purple-600" />
                          <span>{selectedItem.eventHours} hrs</span>
                        </div>
                      )}
                      {selectedItem.capacity && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-indigo-600" />
                          <span>{selectedItem.capacity} seats</span>
                        </div>
                      )}
                      {selectedItem.address && (
                        <div className="flex items-center gap-1 col-span-2">
                          <MapPin className="w-3 h-3 text-red-500" />
                          <span className="truncate">{selectedItem.address}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedItem.type === 'product' && (
                    <div className="flex gap-4 text-xs">
                      <span><strong>Price:</strong> ${selectedItem.price}</span>
                      <span><strong>Stock:</strong> {selectedItem.inventory || 0}</span>
                    </div>
                  )}
                </>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-2 justify-end border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    handleReject(selectedItem.id);
                    setViewDialogOpen(false);
                  }}
                  disabled={rejectMutation.isPending}
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    handleAccept(selectedItem.id);
                    setViewDialogOpen(false);
                  }}
                  disabled={acceptMutation.isPending}
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
