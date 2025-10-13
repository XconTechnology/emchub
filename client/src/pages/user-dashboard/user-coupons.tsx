import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Ticket, Plus, Trash2, Calendar, Users, BarChart3, Edit, Power } from "lucide-react";
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
    discountType: "cash" as "cash" | "timedollar" | "both",
    cashDiscountType: "percentage" as "percentage" | "fixed",
    cashDiscountValue: "",
    tdDiscountType: "percentage" as "percentage" | "fixed",
    tdDiscountValue: "",
    usageLimit: "",
    validFrom: "",
    validUntil: "",
    isActive: true,
  });

  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ["/api/coupons/vendor"],
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/coupons", viewingAnalytics?.id, "analytics"],
    enabled: !!viewingAnalytics,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("/api/coupons", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coupons/vendor"] });
      toast({ title: "Coupon created successfully" });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Failed to create coupon", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => 
      apiRequest(`/api/coupons/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coupons/vendor"] });
      toast({ title: "Coupon updated successfully" });
      setEditingCoupon(null);
    },
    onError: (error: any) => {
      toast({ title: "Failed to update coupon", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest(`/api/coupons/${id}`, "DELETE"),
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
      discountType: "cash",
      cashDiscountType: "percentage",
      cashDiscountValue: "",
      tdDiscountType: "percentage",
      tdDiscountValue: "",
      usageLimit: "",
      validFrom: "",
      validUntil: "",
      isActive: true,
    });
  };

  const loadEditForm = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      title: coupon.title || "",
      description: coupon.description || "",
      discountType: coupon.discountType as any,
      cashDiscountType: (coupon.cashDiscountType || "percentage") as any,
      cashDiscountValue: coupon.cashDiscountValue || "",
      tdDiscountType: (coupon.tdDiscountType || "percentage") as any,
      tdDiscountValue: coupon.tdDiscountValue || "",
      usageLimit: coupon.usageLimit?.toString() || "",
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : "",
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : "",
      isActive: coupon.isActive ?? true,
    });
    setEditingCoupon(coupon);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload: any = {
      code: formData.code.toUpperCase(),
      title: formData.title,
      description: formData.description,
      discountType: formData.discountType,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
      validFrom: formData.validFrom || undefined,
      validUntil: formData.validUntil || undefined,
      isActive: formData.isActive,
    };

    // Add cash discount fields if applicable
    if (formData.discountType === 'cash' || formData.discountType === 'both') {
      payload.cashDiscountType = formData.cashDiscountType;
      payload.cashDiscountValue = formData.cashDiscountValue;
    }

    // Add TD discount fields if applicable
    if (formData.discountType === 'timedollar' || formData.discountType === 'both') {
      payload.tdDiscountType = formData.tdDiscountType;
      payload.tdDiscountValue = formData.tdDiscountValue;
    }

    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const getDiscountDisplay = (coupon: Coupon) => {
    const parts = [];
    
    if (coupon.discountType === 'cash' || coupon.discountType === 'both') {
      const cashDiscount = coupon.cashDiscountType === 'percentage' 
        ? `${coupon.cashDiscountValue}% off Cash`
        : `$${coupon.cashDiscountValue} off Cash`;
      parts.push(cashDiscount);
    }
    
    if (coupon.discountType === 'timedollar' || coupon.discountType === 'both') {
      const tdDiscount = coupon.tdDiscountType === 'percentage'
        ? `${coupon.tdDiscountValue}% off TD`
        : `${coupon.tdDiscountValue} TD off`;
      parts.push(tdDiscount);
    }
    
    return parts.join(' + ');
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
          <p className="text-gray-600">Create and manage discount coupons for your products and services</p>
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
              <DialogTitle>Create New Coupon</DialogTitle>
              <DialogDescription>
                Create a discount coupon that customers can use at checkout
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
                      <SelectItem value="cash">Cash Only</SelectItem>
                      <SelectItem value="timedollar">TimeDollar Only</SelectItem>
                      <SelectItem value="both">Both Cash & TimeDollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(formData.discountType === 'cash' || formData.discountType === 'both') && (
                  <div className="border-l-4 border-green-500 pl-4 space-y-3">
                    <h4 className="font-semibold text-sm text-green-700">Cash Discount</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="cashDiscountType">Type*</Label>
                        <Select
                          value={formData.cashDiscountType}
                          onValueChange={(value: any) => setFormData({ ...formData, cashDiscountType: value })}
                        >
                          <SelectTrigger data-testid="select-cash-discount-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="cashDiscountValue">Value*</Label>
                        <Input
                          id="cashDiscountValue"
                          data-testid="input-cash-discount-value"
                          type="number"
                          step="0.01"
                          placeholder={formData.cashDiscountType === "percentage" ? "10" : "5.00"}
                          value={formData.cashDiscountValue}
                          onChange={(e) => setFormData({ ...formData, cashDiscountValue: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(formData.discountType === 'timedollar' || formData.discountType === 'both') && (
                  <div className="border-l-4 border-blue-500 pl-4 space-y-3">
                    <h4 className="font-semibold text-sm text-blue-700">TimeDollar Discount</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="tdDiscountType">Type*</Label>
                        <Select
                          value={formData.tdDiscountType}
                          onValueChange={(value: any) => setFormData({ ...formData, tdDiscountType: value })}
                        >
                          <SelectTrigger data-testid="select-td-discount-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="fixed">Fixed Amount (TD)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="tdDiscountValue">Value*</Label>
                        <Input
                          id="tdDiscountValue"
                          data-testid="input-td-discount-value"
                          type="number"
                          step="0.01"
                          placeholder={formData.tdDiscountType === "percentage" ? "10" : "5"}
                          value={formData.tdDiscountValue}
                          onChange={(e) => setFormData({ ...formData, tdDiscountValue: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

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

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    data-testid="switch-is-active"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active (customers can use this coupon)</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-submit-coupon" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Coupon"}
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
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-2xl font-mono" data-testid={`text-code-${coupon.id}`}>
                        {coupon.code}
                      </CardTitle>
                      <Badge variant={coupon.isActive ? "default" : "secondary"} data-testid={`status-${coupon.id}`}>
                        <Power className="w-3 h-3 mr-1" />
                        {coupon.isActive ? "Active" : "Inactive"}
                      </Badge>
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
                    <Button
                      variant="outline"
                      size="icon"
                      data-testid={`button-edit-${coupon.id}`}
                      onClick={() => loadEditForm(coupon)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
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

      {/* Edit Dialog */}
      <Dialog open={!!editingCoupon} onOpenChange={(open) => { if (!open) { setEditingCoupon(null); resetForm(); } }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>
              Update your coupon details
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
                    <SelectItem value="cash">Cash Only</SelectItem>
                    <SelectItem value="timedollar">TimeDollar Only</SelectItem>
                    <SelectItem value="both">Both Cash & TimeDollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.discountType === 'cash' || formData.discountType === 'both') && (
                <div className="border-l-4 border-green-500 pl-4 space-y-3">
                  <h4 className="font-semibold text-sm text-green-700">Cash Discount</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-cashDiscountType">Type*</Label>
                      <Select
                        value={formData.cashDiscountType}
                        onValueChange={(value: any) => setFormData({ ...formData, cashDiscountType: value })}
                      >
                        <SelectTrigger data-testid="select-edit-cash-discount-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-cashDiscountValue">Value*</Label>
                      <Input
                        id="edit-cashDiscountValue"
                        data-testid="input-edit-cash-discount-value"
                        type="number"
                        step="0.01"
                        value={formData.cashDiscountValue}
                        onChange={(e) => setFormData({ ...formData, cashDiscountValue: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {(formData.discountType === 'timedollar' || formData.discountType === 'both') && (
                <div className="border-l-4 border-blue-500 pl-4 space-y-3">
                  <h4 className="font-semibold text-sm text-blue-700">TimeDollar Discount</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-tdDiscountType">Type*</Label>
                      <Select
                        value={formData.tdDiscountType}
                        onValueChange={(value: any) => setFormData({ ...formData, tdDiscountType: value })}
                      >
                        <SelectTrigger data-testid="select-edit-td-discount-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="fixed">Fixed Amount (TD)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-tdDiscountValue">Value*</Label>
                      <Input
                        id="edit-tdDiscountValue"
                        data-testid="input-edit-td-discount-value"
                        type="number"
                        step="0.01"
                        value={formData.tdDiscountValue}
                        onChange={(e) => setFormData({ ...formData, tdDiscountValue: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

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

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  data-testid="switch-edit-is-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="edit-isActive">Active (customers can use this coupon)</Label>
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

      {/* Analytics Dialog */}
      <Dialog open={!!viewingAnalytics} onOpenChange={() => setViewingAnalytics(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Coupon Analytics: {viewingAnalytics?.code}</DialogTitle>
            <DialogDescription>
              View detailed usage statistics for this coupon
            </DialogDescription>
          </DialogHeader>
          {analytics ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Uses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold" data-testid="text-analytics-total-used">{analytics.totalUsed}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Cash Discount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600" data-testid="text-analytics-cash-discount">
                      ${analytics.totalCashDiscount.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total TD Discount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-600" data-testid="text-analytics-td-discount">
                      {analytics.totalTdDiscount} TD
                    </p>
                  </CardContent>
                </Card>
              </div>

              {analytics.users && analytics.users.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Usage History</h3>
                  <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                    {analytics.users.map((usage: any) => (
                      <div key={usage.id} className="p-3 flex justify-between items-center" data-testid={`usage-${usage.id}`}>
                        <div>
                          <p className="font-medium">{usage.userName}</p>
                          <p className="text-sm text-gray-500">{usage.userEmail}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(usage.createdAt).toLocaleDateString()} {new Date(usage.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          {Number(usage.cashDiscount) > 0 && (
                            <p className="text-sm text-green-600">-${Number(usage.cashDiscount).toFixed(2)}</p>
                          )}
                          {Number(usage.tdDiscount) > 0 && (
                            <p className="text-sm text-blue-600">-{usage.tdDiscount} TD</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p>Loading analytics...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCoupon} onOpenChange={() => setDeletingCoupon(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete coupon "{deletingCoupon?.code}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingCoupon && deleteMutation.mutate(deletingCoupon.id)}
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
