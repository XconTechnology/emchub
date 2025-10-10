import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Ticket, Plus } from "lucide-react";

export default function UserCoupons() {
  const { user } = useAuth();

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
          <h2 className="text-2xl font-bold">Coupons</h2>
          <p className="text-gray-600">Create and manage discount coupons for your products and services</p>
        </div>
        <Button data-testid="button-add-coupon">
          <Plus className="w-4 h-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      <Card className="text-center py-12">
        <CardContent>
          <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No coupons yet</p>
          <p className="text-sm text-gray-500 mb-4">
            Create discount coupons to attract customers and promote your offerings
          </p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Coupon
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
