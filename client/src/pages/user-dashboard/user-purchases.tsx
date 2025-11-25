import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Package, Calendar, DollarSign, Clock, MessageCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

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

interface Dispute {
  id: string;
  orderId: string;
  status: string;
  reason: string;
  resolutionNote?: string;
  deadline: string;
  createdAt: string;
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
  dispute?: Dispute;
}

export default function UserPurchases() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [disputeReason, setDisputeReason] = useState("");

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

  // Create dispute mutation
  const createDisputeMutation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason: string }) => {
      return apiRequest('POST', '/api/disputes', {
        orderId,
        reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders/user'] });
      setDisputeDialogOpen(false);
      setDisputeReason("");
      setSelectedOrder(null);
      toast({
        title: "Dispute Created",
        description: "Your dispute has been submitted and a mediator will be assigned to review it.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create dispute",
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

  const handleOpenDispute = (order: Order) => {
    setSelectedOrder(order);
    setDisputeDialogOpen(true);
  };

  const handleSubmitDispute = () => {
    if (!selectedOrder || !disputeReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for the dispute",
        variant: "destructive",
      });
      return;
    }

    createDisputeMutation.mutate({
      orderId: selectedOrder.id,
      reason: disputeReason,
    });
  };

  const canOpenDispute = (order: Order) => {
    // Can only open disputes for TD orders that are delivered
    const hasTdPayment = order.paymentMethod === 'timedollar' || order.paymentMethod === 'both';
    const isDelivered = order.status.toLowerCase() === 'delivered';
    const noExistingDispute = !order.dispute;
    
    return hasTdPayment && isDelivered && noExistingDispute;
  };

  const getDisputeStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
              
              {/* Dispute Status */}
              {order.dispute && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium">Dispute Status:</span>
                      <Badge className={getDisputeStatusColor(order.dispute.status)} data-testid={`badge-dispute-${order.id}`}>
                        {order.dispute.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Reason:</span> {order.dispute.reason}
                    </p>
                    {order.dispute.resolutionNote && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Resolution:</span> {order.dispute.resolutionNote}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Deadline: {format(new Date(order.dispute.deadline), 'PPP')}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleChatWithVendor(order)}
                  disabled={createConversationMutation.isPending}
                  data-testid={`button-chat-vendor-${order.id}`}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {createConversationMutation.isPending ? "Opening chat..." : "Chat with Vendor"}
                </Button>
                
                {canOpenDispute(order) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDispute(order)}
                    data-testid={`button-open-dispute-${order.id}`}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Open Dispute
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dispute Dialog */}
      <Dialog open={disputeDialogOpen} onOpenChange={setDisputeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" data-testid="dialog-open-dispute">
          <DialogHeader>
            <DialogTitle>Open a Dispute</DialogTitle>
            <DialogDescription>
              Please describe the issue with your order. A mediator will be assigned to review and resolve the dispute within 20 working days.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedOrder && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p><span className="font-medium">Order ID:</span> #{selectedOrder.id.slice(0, 8)}</p>
                <p><span className="font-medium">Total Amount:</span> ${parseFloat(selectedOrder.totalAmount.toString()).toFixed(2)}</p>
                {selectedOrder.tdAmount && (
                  <p><span className="font-medium">TD Amount:</span> {parseFloat(selectedOrder.tdAmount.toString()).toFixed(0)} TimeDollars</p>
                )}
              </div>
            )}
            <div>
              <label htmlFor="dispute-reason" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Dispute Reason *
              </label>
              <Textarea
                id="dispute-reason"
                placeholder="Explain why you are opening a dispute..."
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                rows={5}
                className="mt-1"
                data-testid="textarea-dispute-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDisputeDialogOpen(false);
                setDisputeReason("");
                setSelectedOrder(null);
              }}
              data-testid="button-cancel-dispute"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitDispute}
              disabled={createDisputeMutation.isPending || !disputeReason.trim()}
              data-testid="button-submit-dispute"
            >
              {createDisputeMutation.isPending ? "Submitting..." : "Submit Dispute"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
