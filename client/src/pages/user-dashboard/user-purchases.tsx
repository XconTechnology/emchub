import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Package, Calendar, DollarSign, Clock, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

interface Vendor {
  id: string;
  username: string;
  email: string;
}

interface Order {
  id: string;
  userId: string;
  vendorId: string;
  totalAmount: number;
  paymentMethod: string;
  cashAmount?: number;
  tdAmount?: number;
  transactionId?: string;
  status: string;
  shippingName: string;
  shippingAddress: string;
  shippingPhone: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
  vendor: Vendor;
}

export default function UserPurchases() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders/user'],
    enabled: !!user,
  });

  // Create or get conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async ({ vendorId, productId, productTitle }: { vendorId: string; productId: string; productTitle: string }) => {
      return apiRequest('POST', '/api/conversations', {
        vendorId,
        productId,
        productTitle,
      });
    },
    onSuccess: () => {
      // Navigate to messages page
      setLocation('/dashboard/messages');
      toast({
        title: "Chat opened",
        description: "You can now message the vendor about your order",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start conversation with vendor",
        variant: "destructive",
      });
    },
  });

  const handleChatWithVendor = (order: Order) => {
    // Use the first product from the order for product context
    const firstProduct = order.items[0];
    if (firstProduct) {
      createConversationMutation.mutate({
        vendorId: order.vendorId,
        productId: firstProduct.productId,
        productTitle: firstProduct.productTitle,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Purchases Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Start shopping to see your purchases here!
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Purchases</h2>
        <p className="text-gray-600 dark:text-gray-400">
          View all your orders and purchase history
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(order.createdAt), 'PPP')}</span>
                  </div>
                </div>
                <Badge className={getStatusColor(order.status)} data-testid={`badge-status-${order.id}`}>
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Shipping To</p>
                  <p className="font-medium">{order.shippingName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{order.shippingAddress}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{order.shippingPhone}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-lg">${parseFloat(order.totalAmount.toString()).toFixed(2)}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      <span className="text-gray-600 dark:text-gray-400 capitalize">Payment: {order.paymentMethod}</span>
                    </div>
                    {order.paymentMethod === 'both' && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 pl-6">
                        ${parseFloat(order.cashAmount?.toString() || '0').toFixed(2)} Cash + {parseFloat(order.tdAmount?.toString() || '0').toFixed(0)} TD
                      </div>
                    )}
                    {order.paymentMethod === 'timedollar' && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 pl-6">
                        {parseFloat(order.tdAmount?.toString() || '0').toFixed(0)} TimeDollars
                      </div>
                    )}
                    {order.transactionId && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 pl-6">
                        Txn: {order.transactionId}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {order.notes && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Notes:</span> {order.notes}
                  </p>
                </div>
              )}
              
              {/* Chat with Vendor Button */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => handleChatWithVendor(order)}
                  disabled={createConversationMutation.isPending}
                  data-testid={`button-chat-vendor-${order.id}`}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {createConversationMutation.isPending ? "Opening chat..." : "Chat with Vendor"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
