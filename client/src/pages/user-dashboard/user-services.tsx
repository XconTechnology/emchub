import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Briefcase, Plus, MessageSquare, Check, X, Clock, Wrench, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useActivity } from "@/contexts/ActivityContext";
import { format } from "date-fns";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

interface ServiceRequest {
  id: string;
  requesterId: string;
  requesterType: string;
  title: string;
  description: string;
  estimatedHours: number | null;
  preferredDate: string | null;
  status: string;
  assignedAdminId: string | null;
  completedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  unreadByAdmin?: number;
  unreadByRequester?: number;
}

// Payment form component using Stripe Elements (without Dialog wrapper)
function PaymentFormContent({ 
  offerId, 
  offer, 
  onClose, 
  onSuccess 
}: { 
  offerId: string; 
  offer: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!stripe || !elements) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/service-offers/${offerId}/accept-and-pay`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Payment failed");
      }
      
      const { clientSecret } = await response.json();
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {},
        },
      });

      if (error) {
        toast({ title: "Payment failed", description: error.message, variant: "destructive" });
      } else if (paymentIntent?.status === "succeeded") {
        try {
          const confirmRes = await fetch(`/api/service-offers/${offerId}/confirm-payment`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
          
          if (!confirmRes.ok) throw new Error("Failed to confirm payment");
        } catch (confirmError: any) {
          console.error("Payment confirmation error:", confirmError);
        }
        
        toast({ title: "Offer accepted and paid successfully!" });
        queryClient.invalidateQueries({ queryKey: ['/api/service-offers'] });
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Complete Payment</DialogTitle>
        <DialogDescription>
          Pay HK${offer?.price} to accept the offer
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
          <p className="text-sm"><strong>Service:</strong> {offer?.serviceName}</p>
          <p className="text-sm"><strong>Amount:</strong> HK${offer?.price}</p>
          <p className="text-sm"><strong>Hours:</strong> {offer?.hoursPerDay}/day</p>
        </div>
        
        <div>
          <Label className="mb-2">Card Details</Label>
          <CardElement className="p-3 border rounded bg-white dark:bg-gray-800" />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessing} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handlePayment} 
            disabled={!stripe || isProcessing} 
            className="flex-1"
            data-testid="button-confirm-payment"
          >
            {isProcessing ? "Processing..." : `Pay HK$${offer?.price}`}
          </Button>
        </div>
      </div>
    </>
  );
}

function UserServicesContent() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [messageDialog, setMessageDialog] = useState<ServiceRequest | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [paymentDialog, setPaymentDialog] = useState<any>(null);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    estimatedHours: "",
    preferredDate: "",
  });

  // Fetch current user
  const { data: currentUser } = useQuery<any>({
    queryKey: ['/api/me'],
  });

  const isActive = useActivity();
  // Fetch user service requests with polling (stops after 1 min inactivity)
  const { data: requests = [] } = useQuery<ServiceRequest[]>({
    queryKey: ['/api/user-service-requests'],
    refetchInterval: isActive ? 5000 : false,
  });

  const { data: messages = [] } = useQuery<any[]>({
    queryKey: ['/api/service-requests', messageDialog?.id, 'messages'],
    queryFn: async () => {
      if (!messageDialog?.id) return [];
      const response = await fetch(`/api/service-requests/${messageDialog.id}/messages`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!messageDialog?.id,
    refetchInterval: isActive ? 3000 : false,
  });

  const { data: offers = [] } = useQuery<any[]>({
    queryKey: ['/api/service-offers', messageDialog?.id],
    queryFn: async () => {
      if (!messageDialog?.id) return [];
      const response = await fetch(`/api/service-offers/${messageDialog.id}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch offers');
      return response.json();
    },
    enabled: !!messageDialog?.id,
    refetchInterval: isActive ? 3000 : false,
  });

  // Notification effect - only notify for messages from OTHER users, not the sender
  useEffect(() => {
    if (messages.length > previousMessageCount && messageDialog && currentUser) {
      const lastMsg = messages[messages.length - 1];
      
      // Only show notification if the message is FROM someone else (not the current user)
      if (lastMsg.senderId !== currentUser.id) {
        // Play notification sound
        const audio = new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==');
        audio.play().catch(() => {}); // Silently fail if audio can't play
        
        // Show toast notification
        toast({
          title: "New message",
          description: `${lastMsg.senderName}: ${lastMsg.message.substring(0, 50)}...`,
        });

        // Update tab title
        document.title = `📬 ${lastMsg.senderName} sent a message - EMC HUB`;
      }
      
      setPreviousMessageCount(messages.length);
    }
  }, [messages, previousMessageCount, messageDialog, currentUser, toast]);

  // Reset tab title when dialog closes
  useEffect(() => {
    if (!messageDialog) {
      document.title = "EMC HUB";
    }
  }, [messageDialog]);

  // Mark messages as read when chat dialog opens
  useEffect(() => {
    if (messageDialog?.id) {
      // Mark all messages in this service request as read
      fetch(`/api/service-requests/${messageDialog.id}/messages/mark-read`, {
        method: 'POST',
        credentials: 'include',
      }).then(() => {
        // Refetch immediately to remove badge
        queryClient.refetchQueries({ queryKey: ['/api/user-service-requests'] });
        queryClient.refetchQueries({ queryKey: ['/api/notifications/unread-counts'] });
        queryClient.refetchQueries({ queryKey: ['/api/service-requests/unread-counts'] });
      }).catch(() => {
        // Silently fail - mark-as-read is not critical
      });
    }
  }, [messageDialog?.id]);

  const submitMutation = useMutation({
    mutationFn: async (data: any) => 
      apiRequest("POST", "/api/user-service-requests", {
        ...data,
        requesterType: 'user',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-service-requests'] });
      toast({ 
        title: "Service request submitted successfully",
        description: "Admin will review your request shortly."
      });
      setFormData({ title: "", description: "", estimatedHours: "", preferredDate: "" });
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to submit request", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ id, message }: { id: string; message: string }) => {
      return apiRequest("POST", `/api/service-requests/${id}/messages`, { message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests', messageDialog?.id, 'messages'] });
      setNewMessage("");
      toast({ title: "Message sent" });
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast({ 
        title: "Missing required fields", 
        description: "Please fill in title and description",
        variant: "destructive"
      });
      return;
    }
    submitMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
      approved: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
      completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    };
    const icons: Record<string, any> = {
      pending: <Clock className="w-3 h-3" />,
      approved: <Check className="w-3 h-3" />,
      in_progress: <Wrench className="w-3 h-3" />,
      completed: <Check className="w-3 h-3" />,
      rejected: <X className="w-3 h-3" />,
    };
    return (
      <Badge className={variants[status] || variants.pending}>
        <span className="flex items-center gap-1">
          {icons[status]}
          {status.replace('_', ' ')}
        </span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
            Service Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Request services from admin
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          data-testid="button-new-request"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Service Request</CardTitle>
            <CardDescription>Submit a request for service to admin</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service-title">Service Title *</Label>
                <Input
                  id="service-title"
                  placeholder="e.g., Need help with moving furniture"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  data-testid="input-service-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-description">Description *</Label>
                <Textarea
                  id="service-description"
                  placeholder="Describe what you need help with..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  data-testid="textarea-service-description"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="service-hours">Estimated Hours</Label>
                  <Input
                    id="service-hours"
                    type="number"
                    placeholder="e.g., 2"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                    data-testid="input-service-hours"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-date">Preferred Date</Label>
                  <Input
                    id="service-date"
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    data-testid="input-service-date"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  data-testid="button-cancel"
                  disabled={submitMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  data-testid="button-submit-request"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Service Requests</CardTitle>
          <CardDescription>All your service requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No service requests yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Click "New Request" to submit your first service request
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        <CardDescription className="mt-1">{request.description}</CardDescription>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2 flex-wrap">
                      {request.estimatedHours && (
                        <div className="text-sm bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded">
                          Hours: {request.estimatedHours}h
                        </div>
                      )}
                      {request.preferredDate && (
                        <div className="text-sm bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded">
                          {format(new Date(request.preferredDate), 'MMM dd, yyyy')}
                        </div>
                      )}
                    </div>
                    {request.status === 'rejected' && request.rejectionReason && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
                        <p className="text-sm font-medium text-red-900 dark:text-red-100">
                          Rejection Reason
                        </p>
                        <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                          {request.rejectionReason}
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                        data-testid={`button-view-${request.id}`}
                      >
                        View Details
                      </Button>
                      {request.status !== 'rejected' && (
                        <div className="relative inline-block">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setMessageDialog(request);
                              setPreviousMessageCount(0);
                            }}
                            data-testid={`button-message-${request.id}`}
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Chat
                          </Button>
                          {(request.unreadByRequester || 0) > 0 && (
                            <span 
                              className="absolute -top-1 left-2 h-5 min-w-5 flex items-center justify-center px-1.5 bg-red-500 text-white text-xs font-semibold rounded-full animate-pulse"
                              data-testid={`badge-unread-${request.id}`}
                            >
                              {request.unreadByRequester}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Request Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedRequest?.title}</DialogTitle>
            <DialogDescription>
              Service request details
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedRequest.description}
                </p>
              </div>

              {selectedRequest.estimatedHours && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Estimated Hours</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedRequest.estimatedHours}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Preferred Date</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedRequest.preferredDate ? format(new Date(selectedRequest.preferredDate), 'MMM dd, yyyy') : 'Not specified'}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Current Status</label>
                <p className="mt-1">{getStatusBadge(selectedRequest.status)}</p>
              </div>

              {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
                  <label className="text-sm font-medium text-red-900 dark:text-red-100">
                    Rejection Reason
                  </label>
                  <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                    {selectedRequest.rejectionReason}
                  </p>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Close
                </Button>
                {selectedRequest.status !== 'rejected' && (
                  <Button
                    onClick={() => {
                      setSelectedRequest(null);
                      setMessageDialog(selectedRequest);
                      setPreviousMessageCount(0);
                    }}
                    data-testid="button-open-chat"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Open Chat
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Messages Dialog */}
      <Dialog open={!!messageDialog} onOpenChange={() => setMessageDialog(null)}>
        <DialogContent className="max-w-2xl max-h-96 flex flex-col">
          <DialogHeader>
            <DialogTitle>Chat - {messageDialog?.title}</DialogTitle>
            <DialogDescription>
              Chat with admin about this service request
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-4">
            {/* Display Unpaid Offers */}
            {offers.filter((o: any) => o.status === 'pending').map((offer: any) => (
              <div key={offer.id} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-green-900 dark:text-green-100">{offer.serviceName}</p>
                    <p className="text-sm text-green-800 dark:text-green-200 mt-1">HK${offer.price} for {offer.hoursPerDay} hours/day</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setPaymentDialog(offer)}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid={`button-accept-pay-${offer.id}`}
                  >
                    <CreditCard className="w-3 h-3 mr-1" />
                    Accept & Pay
                  </Button>
                </div>
              </div>
            ))}

            {messages.length === 0 && offers.filter((o: any) => o.status === 'pending').length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-4">No messages or offers yet. Start a conversation!</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                  <p className="text-sm font-medium">{msg.senderName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{msg.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(msg.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message... (Shift+Enter for newline)"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (messageDialog && newMessage.trim()) {
                    sendMessageMutation.mutate({
                      id: messageDialog.id,
                      message: newMessage,
                    });
                  }
                }
              }}
              rows={2}
              data-testid="textarea-message"
            />
            <Button
              onClick={() => {
                if (messageDialog && newMessage.trim()) {
                  sendMessageMutation.mutate({
                    id: messageDialog.id,
                    message: newMessage,
                  });
                }
              }}
              disabled={sendMessageMutation.isPending}
              data-testid="button-send-message"
            >
              Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={!!paymentDialog} onOpenChange={() => setPaymentDialog(null)}>
        <DialogContent className="max-w-md">
          {paymentDialog && (
            <PaymentFormContent
              offerId={paymentDialog.id}
              offer={paymentDialog}
              onClose={() => setPaymentDialog(null)}
              onSuccess={() => {
                setPreviousMessageCount(0);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function UserServices() {
  return (
    <Elements stripe={stripePromise}>
      <UserServicesContent />
    </Elements>
  );
}
