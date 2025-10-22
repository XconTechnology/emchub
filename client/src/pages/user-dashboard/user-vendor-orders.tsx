import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Package, Clock, CheckCircle, XCircle, Truck, Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderItem {
  id: string;
  productTitle: string;
  productPrice: string;
  quantity: number;
  subtotal: string;
}

interface Customer {
  id: string;
  username: string;
  email: string;
}

interface Order {
  id: string;
  userId: string;
  vendorId: string;
  totalAmount: string;
  status: string;
  paymentMethod: string;
  cashAmount: string;
  tdAmount: string;
  transactionId: string;
  shippingName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  customer: Customer;
}

export default function UserVendorOrders() {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/vendor/orders'],
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      return await apiRequest('PATCH', `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendor/orders'] });
      toast({
        title: "Order status updated",
        description: "The order status has been updated successfully.",
      });
      setSelectedOrder(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
      pending: { label: "Pending", variant: "outline", icon: Clock },
      confirmed: { label: "Confirmed", variant: "default", icon: CheckCircle },
      shipped: { label: "Shipped", variant: "secondary", icon: Truck },
      delivered: { label: "Delivered", variant: "default", icon: CheckCircle },
      cancelled: { label: "Cancelled", variant: "destructive", icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#8FC24C]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Package className="w-8 h-8 text-[#8FC24C]" />
          Vendor Orders
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage orders for your products
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No orders yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
              When customers order your products, they will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow" data-testid={`card-order-${order.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Order #{order.transactionId}
                    </CardTitle>
                    <CardDescription>
                      Placed on {format(new Date(order.createdAt), "PPP")}
                    </CardDescription>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Customer Information
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Name:</span> {order.shippingName}</p>
                      <p><span className="font-medium">Email:</span> {order.customer?.email || order.shippingEmail}</p>
                      <p><span className="font-medium">Phone:</span> {order.shippingPhone}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Shipping Address
                    </h4>
                    <p className="text-sm">
                      {order.shippingAddress}<br />
                      {order.shippingCity} {order.shippingPostalCode}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Order Items ({order.items?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div>
                          <p className="font-medium">{item.productTitle}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Quantity: {item.quantity} × HK${parseFloat(item.productPrice).toFixed(2)}
                          </p>
                        </div>
                        <p className="font-semibold">HK${parseFloat(item.subtotal).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Payment Method:</span>
                    <Badge variant="outline">
                      {order.paymentMethod === 'cash' && 'Cash'}
                      {order.paymentMethod === 'timedollar' && 'TimeDollar'}
                      {order.paymentMethod === 'both' && 'Cash + TimeDollar'}
                    </Badge>
                  </div>
                  {order.paymentMethod === 'both' && (
                    <div className="text-sm space-y-1 mb-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cash:</span>
                        <span>HK${parseFloat(order.cashAmount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">TimeDollar:</span>
                        <span>{parseFloat(order.tdAmount).toFixed(2)} TD</span>
                      </div>
                    </div>
                  )}
                  {order.paymentMethod === 'timedollar' && (
                    <div className="text-sm flex justify-between mb-2">
                      <span className="text-gray-600">TimeDollar:</span>
                      <span>{parseFloat(order.tdAmount).toFixed(2)} TD</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-[#8FC24C]">HK${parseFloat(order.totalAmount).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                    data-testid={`button-view-order-${order.id}`}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  
                  {order.status === 'pending' && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleStatusChange(order.id, 'confirmed')}
                        disabled={updateOrderStatusMutation.isPending}
                        data-testid={`button-confirm-order-${order.id}`}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirm Order
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleStatusChange(order.id, 'cancelled')}
                        disabled={updateOrderStatusMutation.isPending}
                        data-testid={`button-cancel-order-${order.id}`}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Cancel Order
                      </Button>
                    </>
                  )}
                  
                  {order.status === 'confirmed' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleStatusChange(order.id, 'shipped')}
                      disabled={updateOrderStatusMutation.isPending}
                      data-testid={`button-ship-order-${order.id}`}
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      Mark as Shipped
                    </Button>
                  )}
                  
                  {order.status === 'shipped' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleStatusChange(order.id, 'delivered')}
                      disabled={updateOrderStatusMutation.isPending}
                      data-testid={`button-deliver-order-${order.id}`}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Delivered
                    </Button>
                  )}
                </div>

                {order.notes && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                    <p className="text-sm"><strong>Customer Notes:</strong> {order.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.transactionId}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Order Status</h4>
                <div className="flex items-center gap-4">
                  {getStatusBadge(selectedOrder.status)}
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => handleStatusChange(selectedOrder.id, value)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Customer</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {selectedOrder.shippingName}</p>
                  <p><strong>Email:</strong> {selectedOrder.customer?.email || selectedOrder.shippingEmail}</p>
                  <p><strong>Phone:</strong> {selectedOrder.shippingPhone}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Shipping Address</h4>
                <p className="text-sm">
                  {selectedOrder.shippingAddress}<br />
                  {selectedOrder.shippingCity} {selectedOrder.shippingPostalCode}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div>
                        <p className="font-medium">{item.productTitle}</p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × HK${parseFloat(item.productPrice).toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold">HK${parseFloat(item.subtotal).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-[#8FC24C]">HK${parseFloat(selectedOrder.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
