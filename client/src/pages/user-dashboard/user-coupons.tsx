import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Ticket, Plus, Trash2, Calendar, Users, BarChart3, Edit, Power, Clock, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { Coupon } from "@shared/schema";

export default function UserCoupons() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
  const [viewingAnalytics, setViewingAnalytics] = useState<Coupon | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    scope: "vendor" as "vendor" | "platform",
    productId: null as string | null,
    usageLimit: "",
    validFrom: "",
    validUntil: "",
  });

  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ["/api/coupons/vendor"],
  });

  const { data: analytics } = useQuery<{
    totalUsed: number;
    totalDiscount: number;
    users: any[];
  }>({
    queryKey: ["/api/coupons", viewingAnalytics?.id, "analytics"],
    enabled: !!viewingAnalytics,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/coupons", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coupons/vendor"] });
      toast({ 
        title: "Coupon submitted for approval",
        description: "Your coupon will be reviewed by an admin before activation."
      });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Failed to create coupon", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => 
      apiRequest("PUT", `/api/coupons/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coupons/vendor"] });
      toast({ title: "Coupon updated successfully" });
      setEditingCoupon(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Failed to update coupon", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/coupons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coupons/vendor"] });
      toast({ title: "Coupon deleted successfully" });
      setDeletingCoupon(null);
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete coupon", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      title: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      scope: "vendor",
      productId: null,
      usageLimit: "",
      validFrom: "",
      validUntil: "",
    });
  };

  const loadEditForm = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      title: coupon.title || "",
      description: coupon.description || "",
      discountType: (coupon.discountType || "percentage") as any,
      discountValue: coupon.discountValue?.toString() || "",
      scope: (coupon.scope || "vendor") as any,
      productId: coupon.productId || null,
      usageLimit: coupon.usageLimit?.toString() || "",
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : "",
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : "",
    });
    setEditingCoupon(coupon);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload: any = {
      code: formData.code.toUpperCase(),
      title: formData.title,
      description: formData.description,
      couponType: "discount",
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      scope: formData.scope,
      productId: formData.scope === "platform" ? null : formData.productId,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
      validFrom: formData.validFrom || undefined,
      validUntil: formData.validUntil || undefined,
    };

    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const getDiscountDisplay = (coupon: Coupon) => {
    if (coupon.couponType === "cash") {
      return `HK$${coupon.discountValue} Cash Coupon`;
    }
    return coupon.discountType === 'percentage' 
      ? `${coupon.discountValue}% off`
      : `HK$${coupon.discountValue} off`;
  };

  const getApprovalBadge = (coupon: Coupon) => {
    if (coupon.status === "approved") {
      return (
        <Badge variant="default" className="bg-green-600" data-testid={`approval-${coupon.id}`}>
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    } else if (coupon.status === "rejected") {
      return (
        <Badge variant="destructive" data-testid={`approval-${coupon.id}`}>
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    } else if (coupon.status === "inactive") {
      return (
        <Badge variant="secondary" data-testid={`approval-${coupon.id}`}>
          <Power className="w-3 h-3 mr-1" />
          Inactive
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" data-testid={`approval-${coupon.id}`}>
          <Clock className="w-3 h-3 mr-1" />
          Pending Approval
        </Badge>
      );
    }
  };

  if (user?.vendorStatus !== 'verified') {
    return (
      <div className="text-center py-12">
        <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Vendor Verification Required</h2>
        <p className="text-gray-600 mb-4">You need to be a verified vendor to access this section.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Coupons</h2>
          <p className="text-gray-600">Create discount coupons for your products and services</p>
          <p className="text-sm text-amber-600 mt-1">
            Note: All vendor coupons require admin approval before activation
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-coupon">
              <Plus className="w-4 h-4 mr-2" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Discount Coupon</DialogTitle>
              <DialogDescription>
                Create a discount coupon that customers can use at checkout. Your coupon will require admin approval.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Coupon Code*</Label>
                  <Input
                    id="code"
                    data-testid="input-code"
                    placeholder="SUMMER2024"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="title">Title*</Label>
                  <Input
                    id="title"
                    data-testid="input-title"
                    placeholder="Summer Sale 2024"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    data-testid="input-description"
                    placeholder="Get discount on all products this summer"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="discountType">Discount Type*</Label>
                    <Select
                      value={formData.discountType}
                      onValueChange={(value: any) => setFormData({ ...formData, discountType: value })}
                    >
                      <SelectTrigger data-testid="select-discount-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount (HK$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="discountValue">Discount Value*</Label>
                    <Input
                      id="discountValue"
                      data-testid="input-discount-value"
                      type="number"
                      step="0.01"
                      placeholder={formData.discountType === "percentage" ? "10" : "50"}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="scope">Coupon Scope*</Label>
                  <Select
                    value={formData.scope}
                    onValueChange={(value: any) => setFormData({ ...formData, scope: value })}
                  >
                    <SelectTrigger data-testid="select-scope">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendor">All My Products/Services</SelectItem>
                      <SelectItem value="platform">Platform-Wide (Admin Only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="usageLimit">Usage Limit (Optional)</Label>
                  <Input
                    id="usageLimit"
                    data-testid="input-usage-limit"
                    type="number"
                    placeholder="100"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="validFrom">Valid From</Label>
                    <Input
                      id="validFrom"
                      data-testid="input-valid-from"
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="validUntil">Valid Until</Label>
                    <Input
                      id="validUntil"
                      data-testid="input-valid-until"
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    />
                  </div>
                </div>

              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-submit-coupon" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Submitting..." : "Submit for Approval"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p>Loading coupons...</p>
        </div>
      ) : coupons.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="pt-6">
            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No coupons yet</p>
            <p className="text-sm text-gray-500 mb-4">
              Create discount coupons to attract customers and promote your offerings
            </p>
            <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-first-coupon">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Coupon
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {coupons.map((coupon) => (
            <Card key={coupon.id} data-testid={`card-coupon-${coupon.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <CardTitle className="text-2xl font-mono" data-testid={`text-code-${coupon.id}`}>
                        {coupon.code}
                      </CardTitle>
                      {getApprovalBadge(coupon)}
                      {coupon.productId && (
                        <Badge variant="outline">Product-Specific</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg mb-1" data-testid={`text-title-${coupon.id}`}>
                      {coupon.title}
                    </CardTitle>
                    <CardDescription data-testid={`text-discount-${coupon.id}`}>
                      {getDiscountDisplay(coupon)}
                    </CardDescription>
                    {coupon.description && (
                      <p className="text-sm text-gray-600 mt-2">{coupon.description}</p>
                    )}
                    {coupon.status === "rejected" && coupon.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-700">
                          <strong>Rejection reason:</strong> {coupon.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      data-testid={`button-analytics-${coupon.id}`}
                      onClick={() => setViewingAnalytics(coupon)}
                    >
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                    {coupon.status !== "approved" && (
                      <Button
                        variant="outline"
                        size="icon"
                        data-testid={`button-edit-${coupon.id}`}
                        onClick={() => loadEditForm(coupon)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      data-testid={`button-delete-${coupon.id}`}
                      onClick={() => setDeletingCoupon(coupon)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600" data-testid={`text-usage-${coupon.id}`}>
                      {coupon.usedCount || 0}/{coupon.usageLimit || "∞"} used
                    </span>
                  </div>
                  {coupon.validFrom && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        From: {new Date(coupon.validFrom).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {coupon.validUntil && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        Until: {new Date(coupon.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog - Similar structure to create but for editing */}
      <Dialog open={!!editingCoupon} onOpenChange={(open) => { if (!open) { setEditingCoupon(null); resetForm(); } }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>
              Update your coupon details. Changes will require re-approval.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-code">Coupon Code*</Label>
                <Input
                  id="edit-code"
                  data-testid="input-edit-code"
                  placeholder="SUMMER2024"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title*</Label>
                <Input
                  id="edit-title"
                  data-testid="input-edit-title"
                  placeholder="Summer Sale 2024"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  data-testid="input-edit-description"
                  placeholder="Get discount on all products this summer"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-discountType">Discount Type*</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value: any) => setFormData({ ...formData, discountType: value })}
                  >
                    <SelectTrigger data-testid="select-edit-discount-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (HK$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-discountValue">Discount Value*</Label>
                  <Input
                    id="edit-discountValue"
                    data-testid="input-edit-discount-value"
                    type="number"
                    step="0.01"
                    placeholder={formData.discountType === "percentage" ? "10" : "50"}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-usageLimit">Usage Limit (Optional)</Label>
                <Input
                  id="edit-usageLimit"
                  data-testid="input-edit-usage-limit"
                  type="number"
                  placeholder="100"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-validFrom">Valid From</Label>
                  <Input
                    id="edit-validFrom"
                    data-testid="input-edit-valid-from"
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-validUntil">Valid Until</Label>
                  <Input
                    id="edit-validUntil"
                    data-testid="input-edit-valid-until"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  />
                </div>
              </div>

            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setEditingCoupon(null); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit" data-testid="button-update-coupon" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Update Coupon"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCoupon} onOpenChange={(open) => !open && setDeletingCoupon(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the coupon "{deletingCoupon?.code}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              data-testid="button-confirm-delete"
              onClick={() => deletingCoupon && deleteMutation.mutate(deletingCoupon.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Analytics Dialog */}
      <Dialog open={!!viewingAnalytics} onOpenChange={(open) => !open && setViewingAnalytics(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Coupon Analytics: {viewingAnalytics?.code}</DialogTitle>
            <DialogDescription>
              View usage statistics for this coupon
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Uses</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold" data-testid="text-total-used">
                    {analytics?.totalUsed || 0}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Discount</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold" data-testid="text-total-discount">
                    HK${analytics?.totalDiscount?.toFixed(2) || "0.00"}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {analytics && analytics.users && analytics.users.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Recent Users</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {analytics.users.map((user: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                      <span>{user.userName}</span>
                      <span className="text-gray-600">HK${user.discount?.toFixed(2) || "0.00"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
