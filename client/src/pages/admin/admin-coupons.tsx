import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Ticket, CheckCircle, XCircle, Clock, Calendar, Users, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Coupon } from "@shared/schema";

export default function AdminCoupons() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  const [rejectingCoupon, setRejectingCoupon] = useState<Coupon | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: allCoupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ["/api/admin/coupons"],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => apiRequest(`/api/admin/coupons/${id}/approve`, "PUT"),
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
      apiRequest(`/api/admin/coupons/${id}/reject`, "PUT", { reason }),
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

  const handleReject = () => {
    if (!rejectingCoupon) return;
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejecting this coupon",
        variant: "destructive",
      });
      return;
    }
    rejectMutation.mutate({ id: rejectingCoupon.id, reason: rejectionReason });
  };

  const pendingCoupons = allCoupons.filter(c => c.status === 'pending');
  const approvedCoupons = allCoupons.filter(c => c.status === 'approved');
  const rejectedCoupons = allCoupons.filter(c => c.status === 'rejected');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderCouponCard = (coupon: Coupon) => (
    <Card key={coupon.id} data-testid={`card-coupon-${coupon.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-2xl font-mono">{coupon.code}</CardTitle>
              {getStatusBadge(coupon.status)}
            </div>
            <CardDescription>
              Vendor: <strong>{coupon.vendorName}</strong>
            </CardDescription>
          </div>
          {coupon.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => approveMutation.mutate(coupon.id)}
                disabled={approveMutation.isPending}
                data-testid={`button-approve-${coupon.id}`}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setRejectingCoupon(coupon)}
                data-testid={`button-reject-${coupon.id}`}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-lg">
              {coupon.discountType === "percentage" 
                ? `${coupon.discountValue}% discount` 
                : `$${coupon.discountValue} off`}
            </p>
            {coupon.minAmount && (
              <p className="text-sm text-gray-600">
                Minimum order: ${coupon.minAmount}
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">
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
          {coupon.applicableListings && coupon.applicableListings.length > 0 && (
            <div className="pt-3 border-t">
              <p className="text-sm text-gray-600">
                <strong>Applicable to:</strong> {coupon.applicableListings.length} specific listing(s)
              </p>
            </div>
          )}
          {coupon.status === "rejected" && coupon.rejectionReason && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Rejection Reason:</strong> {coupon.rejectionReason}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p>Loading coupons...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Coupon Management</h2>
        <p className="text-gray-600">Review and approve vendor coupon submissions</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCoupons.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCoupons.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedCoupons.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" data-testid="tab-all">
            All ({allCoupons.length})
          </TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">
            Pending ({pendingCoupons.length})
          </TabsTrigger>
          <TabsTrigger value="approved" data-testid="tab-approved">
            Approved ({approvedCoupons.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" data-testid="tab-rejected">
            Rejected ({rejectedCoupons.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {allCoupons.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No coupons found</p>
              </CardContent>
            </Card>
          ) : (
            allCoupons.map(renderCouponCard)
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingCoupons.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No pending coupons</p>
              </CardContent>
            </Card>
          ) : (
            pendingCoupons.map(renderCouponCard)
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-6">
          {approvedCoupons.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No approved coupons</p>
              </CardContent>
            </Card>
          ) : (
            approvedCoupons.map(renderCouponCard)
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-6">
          {rejectedCoupons.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No rejected coupons</p>
              </CardContent>
            </Card>
          ) : (
            rejectedCoupons.map(renderCouponCard)
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!rejectingCoupon} onOpenChange={() => setRejectingCoupon(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reject Coupon</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting coupon "{rejectingCoupon?.code}"
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rejection-reason">Rejection Reason*</Label>
              <Textarea
                id="rejection-reason"
                data-testid="textarea-rejection-reason"
                placeholder="Please specify why this coupon is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRejectingCoupon(null);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
              data-testid="button-confirm-reject"
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject Coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
