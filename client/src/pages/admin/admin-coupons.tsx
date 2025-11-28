import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Ticket, Calendar, Users, BarChart3, Search, Plus, 
  CheckCircle, XCircle, Clock, Power, DollarSign 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Coupon } from "@shared/schema";

export default function AdminCoupons() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingAnalytics, setViewingAnalytics] = useState<Coupon | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [rejectingCoupon, setRejectingCoupon] = useState<Coupon | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterIssuer, setFilterIssuer] = useState<string>("all");

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    couponType: "discount" as "discount" | "cash",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    cashValue: "",
    scope: "platform" as "platform" | "product",
    productId: null as string | null,
    usageLimit: "",
    validFrom: "",
    validUntil: "",
  });

  const { data: allCoupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ["/api/admin/coupons", filterStatus !== "all" ? filterStatus : undefined, filterIssuer !== "all" ? filterIssuer : undefined],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterIssuer !== "all") params.append("issuer", filterIssuer);
      const url = `/api/admin/coupons${params.toString() ? `?${params}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch coupons");
      return response.json();
    },
  });

  const { data: allProducts = [] } = useQuery<any[]>({
    queryKey: ["/api/listings"],
    queryFn: async () => {
      const response = await fetch("/api/listings?status=published");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
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
    mutationFn: async (data: any) => apiRequest("POST", "/api/admin/coupons", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({ title: "Coupon created successfully" });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Failed to create coupon", description: error.message, variant: "destructive" });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => 
      apiRequest("POST", `/api/admin/coupons/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({ title: "Coupon approved successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to approve coupon", description: error.message, variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) =>
      apiRequest("POST", `/api/admin/coupons/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({ title: "Coupon rejected" });
      setRejectingCoupon(null);
      setRejectionReason("");
    },
    onError: (error: any) => {
      toast({ title: "Failed to reject coupon", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      title: "",
      description: "",
      couponType: "discount",
      discountType: "percentage",
      discountValue: "",
      cashValue: "",
      scope: "platform",
      productId: null,
      usageLimit: "",
      validFrom: "",
      validUntil: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate product selection when scope is product-specific
    if (formData.scope === "product" && !formData.productId) {
      toast({
        title: "Product required",
        description: "Please select a product for product-specific coupons.",
        variant: "destructive",
      });
      return;
    }
    
    const payload: any = {
      code: formData.code.toUpperCase(),
      title: formData.title,
      description: formData.description,
      couponType: formData.couponType,
      scope: formData.scope,
      productId: formData.scope === "platform" ? null : formData.productId,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
      validFrom: formData.validFrom || undefined,
      validUntil: formData.validUntil || undefined,
    };

    if (formData.couponType === "discount") {
      payload.discountType = formData.discountType;
      payload.discountValue = parseFloat(formData.discountValue);
    } else {
      payload.cashValue = parseFloat(formData.cashValue);
    }

    createMutation.mutate(payload);
  };

  const filteredCoupons = allCoupons.filter(coupon => {
    const query = searchQuery.toLowerCase();
    return (
      coupon.code.toLowerCase().includes(query) ||
      coupon.title?.toLowerCase().includes(query) ||
      coupon.description?.toLowerCase().includes(query)
    );
  });

  const getDiscountDisplay = (coupon: Coupon) => {
    if (coupon.couponType === "cash") {
      return `HK$${coupon.cashValue || coupon.discountValue} Cash Coupon`;
    }
    return coupon.discountType === 'percentage' 
      ? `${coupon.discountValue}% off`
      : `HK$${coupon.discountValue} off`;
  };

  const getStatusBadge = (coupon: Coupon) => {
    if (coupon.status === "approved") {
      return (
        <Badge variant="default" className="bg-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    } else if (coupon.status === "rejected") {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    } else if (coupon.status === "inactive") {
      return (
        <Badge variant="secondary">
          <Power className="w-3 h-3 mr-1" />
          Inactive
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    }
  };

  const pendingCoupons = allCoupons.filter(c => c.status === "pending");
  const activeCoupons = allCoupons.filter(c => c.status === "approved");
  const totalUsage = allCoupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Coupon Management</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2" data-testid="text-admin-coupons-title">Coupon Management</h1>
            <p className="text-gray-600">Manage all coupons and approve vendor requests</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-coupon">
                <Plus className="w-4 h-4 mr-2" />
                Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Platform Coupon</DialogTitle>
                <DialogDescription>
                  Create a discount or cash coupon for the platform
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="couponType">Coupon Type*</Label>
                    <Select
                      value={formData.couponType}
                      onValueChange={(value: any) => setFormData({ ...formData, couponType: value })}
                    >
                      <SelectTrigger data-testid="select-coupon-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discount">Discount Coupon (% or HK$ off)</SelectItem>
                        <SelectItem value="cash">Cash Coupon (Fixed HK$ value)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="code">Coupon Code*</Label>
                    <Input
                      id="code"
                      data-testid="input-code"
                      placeholder="PLATFORM2024"
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
                      placeholder="Platform-Wide Sale"
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
                      placeholder="Platform-wide discount for all users"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="scope">Coupon Scope*</Label>
                    <Select
                      value={formData.scope}
                      onValueChange={(value: any) => setFormData({ ...formData, scope: value, productId: value === "platform" ? null : formData.productId })}
                    >
                      <SelectTrigger data-testid="select-scope">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="platform">Platform-Wide (All Products)</SelectItem>
                        <SelectItem value="product">Specific Product Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.scope === "product" && (
                    <div className="grid gap-2">
                      <Label htmlFor="productId">Select Product*</Label>
                      <Select
                        value={formData.productId || ""}
                        onValueChange={(value) => setFormData({ ...formData, productId: value })}
                      >
                        <SelectTrigger data-testid="select-product">
                          <SelectValue placeholder="Choose a product..." />
                        </SelectTrigger>
                        <SelectContent>
                          {allProducts.filter(p => p.type === "product").map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {formData.couponType === "discount" ? (
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
                  ) : (
                    <div className="grid gap-2">
                      <Label htmlFor="cashValue">Cash Value (HK$)*</Label>
                      <Input
                        id="cashValue"
                        data-testid="input-cash-value"
                        type="number"
                        step="0.01"
                        placeholder="60"
                        value={formData.cashValue}
                        onChange={(e) => setFormData({ ...formData, cashValue: e.target.value })}
                        required
                      />
                      <p className="text-sm text-gray-500">
                        Cash coupons have a fixed HK$ value (e.g., HK$60 = 1 TD redemption)
                      </p>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="usageLimit">Usage Limit (Optional)</Label>
                    <Input
                      id="usageLimit"
                      data-testid="input-usage-limit"
                      type="number"
                      placeholder="1000"
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
                    {createMutation.isPending ? "Creating..." : "Create Coupon"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Coupons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold" data-testid="text-total-coupons">{allCoupons.length}</p>
                <Ticket className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-amber-600" data-testid="text-pending-coupons">{pendingCoupons.length}</p>
                <Clock className="w-8 h-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Coupons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-green-600" data-testid="text-active-coupons">{activeCoupons.length}</p>
                <Power className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-blue-600" data-testid="text-total-usage">{totalUsage}</p>
                <BarChart3 className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search coupons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-coupons"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]" data-testid="select-filter-status">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterIssuer} onValueChange={setFilterIssuer}>
            <SelectTrigger className="w-[180px]" data-testid="select-filter-issuer">
              <SelectValue placeholder="Filter by issuer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Issuers</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="vendor">Vendor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Coupons List */}
        {filteredCoupons.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchQuery ? "No coupons match your search" : "No coupons found"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredCoupons.map((coupon) => (
              <Card key={coupon.id} data-testid={`card-coupon-${coupon.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <CardTitle className="text-2xl font-mono" data-testid={`text-code-${coupon.id}`}>
                          {coupon.code}
                        </CardTitle>
                        {getStatusBadge(coupon)}
                        <Badge variant={coupon.couponType === "cash" ? "default" : "outline"}>
                          {coupon.couponType === "cash" ? "Cash Coupon" : "Discount"}
                        </Badge>
                        <Badge variant="outline">
                          {coupon.issuer === "admin" ? "Platform" : "Vendor"}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mb-1">
                        {coupon.title}
                      </CardTitle>
                      <CardDescription className="space-y-1">
                        <div>{getDiscountDisplay(coupon)}</div>
                        {coupon.description && (
                          <div className="text-sm mt-1">{coupon.description}</div>
                        )}
                      </CardDescription>
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
                        size="sm"
                        data-testid={`button-analytics-${coupon.id}`}
                        onClick={() => setViewingAnalytics(coupon)}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics
                      </Button>
                      {coupon.status === "pending" && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            data-testid={`button-approve-${coupon.id}`}
                            onClick={() => approveMutation.mutate(coupon.id)}
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            data-testid={`button-reject-${coupon.id}`}
                            onClick={() => setRejectingCoupon(coupon)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600" data-testid={`text-usage-${coupon.id}`}>
                        {coupon.usedCount || 0}/{coupon.usageLimit || "∞"} used
                      </span>
                    </div>
                    {coupon.validFrom && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 text-xs">
                          From: {new Date(coupon.validFrom).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {coupon.validUntil && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 text-xs">
                          Until: {new Date(coupon.validUntil).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 text-xs">
                        Created: {coupon.createdAt ? new Date(coupon.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Rejection Dialog */}
        <AlertDialog open={!!rejectingCoupon} onOpenChange={(open) => {
          if (!open) {
            setRejectingCoupon(null);
            setRejectionReason("");
          }
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject Coupon</AlertDialogTitle>
              <AlertDialogDescription>
                Please provide a reason for rejecting coupon "{rejectingCoupon?.code}"
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Textarea
              placeholder="Reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              data-testid="input-rejection-reason"
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                data-testid="button-confirm-reject"
                onClick={() => rejectingCoupon && rejectMutation.mutate({ 
                  id: rejectingCoupon.id, 
                  reason: rejectionReason 
                })}
                className="bg-red-600 hover:bg-red-700"
                disabled={!rejectionReason.trim() || rejectMutation.isPending}
              >
                Reject Coupon
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Analytics Dialog */}
        <Dialog open={!!viewingAnalytics} onOpenChange={() => setViewingAnalytics(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Coupon Analytics: {viewingAnalytics?.code}</DialogTitle>
              <DialogDescription>
                Detailed usage statistics for this coupon
              </DialogDescription>
            </DialogHeader>
            {analytics ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                      <CardTitle className="text-sm font-medium text-gray-600">Total Discount</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-600" data-testid="text-analytics-discount">
                        HK${analytics.totalDiscount?.toFixed(2) || "0.00"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {analytics.users && analytics.users.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Recent Users</h3>
                    <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                      {analytics.users.map((user: any, idx: number) => (
                        <div key={idx} className="p-3 flex justify-between items-center">
                          <span className="font-medium">{user.userName}</span>
                          <span className="text-sm text-green-600">HK${user.discount?.toFixed(2) || "0.00"}</span>
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
      </div>
    </div>
  );
}
