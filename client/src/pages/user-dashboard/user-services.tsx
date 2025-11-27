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
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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
}

export default function UserServices() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [messageDialog, setMessageDialog] = useState<ServiceRequest | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    estimatedHours: "",
    preferredDate: "",
  });

  // Fetch only user service requests (not vendor requests)
  const { data: requests = [] } = useQuery<ServiceRequest[]>({
    queryKey: ['/api/user-service-requests'],
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
    refetchInterval: 3000,
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
    refetchInterval: 3000,
  });

  const acceptOfferMutation = useMutation({
    mutationFn: async (offerId: string) => {
      return apiRequest("POST", `/api/service-offers/${offerId}/accept-and-pay`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-offers', messageDialog?.id] });
      toast({ title: "Offer accepted! Proceeding to payment..." });
    },
    onError: (error: any) => {
      toast({ title: "Failed to accept offer", description: error.message, variant: "destructive" });
    },
  });

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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMessageDialog(request)}
                          data-testid={`button-message-${request.id}`}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Chat
                        </Button>
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
                    onClick={() => acceptOfferMutation.mutate(offer.id)}
                    disabled={acceptOfferMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid={`button-accept-pay-${offer.id}`}
                  >
                    <CreditCard className="w-3 h-3 mr-1" />
                    {acceptOfferMutation.isPending ? "Processing..." : "Accept & Pay"}
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
    </div>
  );
}
