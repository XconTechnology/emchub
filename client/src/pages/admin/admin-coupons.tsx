import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Ticket, Calendar, Users, DollarSign, BarChart3, Power, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Coupon } from "@shared/schema";

export default function AdminCoupons() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingAnalytics, setViewingAnalytics] = useState<Coupon | null>(null);

  const { data: allCoupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ["/api/admin/coupons"],
  });

  const { data: analytics } = useQuery<{
    totalUsed: number;
    totalCashDiscount: number;
    totalTdDiscount: number;
    users: any[];
  }>({
    queryKey: ["/api/coupons", viewingAnalytics?.id, "analytics"],
    enabled: !!viewingAnalytics,
  });

  const filteredCoupons = allCoupons.filter(coupon => {
    const query = searchQuery.toLowerCase();
    return (
      coupon.code.toLowerCase().includes(query) ||
      coupon.title?.toLowerCase().includes(query) ||
      coupon.description?.toLowerCase().includes(query)
    );
  });

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

  const totalActiveCoupons = allCoupons.filter(c => c.isActive).length;
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
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-admin-coupons-title">Coupon Management</h1>
          <p className="text-gray-600">View and manage all vendor coupons across the platform</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
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
              <CardTitle className="text-sm font-medium text-gray-600">Active Coupons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-green-600" data-testid="text-active-coupons">{totalActiveCoupons}</p>
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

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search coupons by code, title, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-coupons"
            />
          </div>
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
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-2xl font-mono" data-testid={`text-code-${coupon.id}`}>
                          {coupon.code}
                        </CardTitle>
                        <Badge variant={coupon.isActive ? "default" : "secondary"} data-testid={`status-${coupon.id}`}>
                          <Power className="w-3 h-3 mr-1" />
                          {coupon.isActive ? "Active" : "Inactive"}
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
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={`button-analytics-${coupon.id}`}
                      onClick={() => setViewingAnalytics(coupon)}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
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

        {/* Analytics Dialog */}
        <Dialog open={!!viewingAnalytics} onOpenChange={() => setViewingAnalytics(null)}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Coupon Analytics: {viewingAnalytics?.code}</DialogTitle>
              <DialogDescription>
                Detailed usage statistics for this coupon
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
      </div>
    </div>
  );
}
