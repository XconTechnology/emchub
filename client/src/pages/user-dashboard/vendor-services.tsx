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
import { Briefcase, Plus, MessageSquare, Check, X, Clock, Wrench } from "lucide-react";
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

export default function VendorServices() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [messageDialog, setMessageDialog] = useState<ServiceRequest | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    estimatedHours: "",
    preferredDate: "",
  });

  // Fetch only vendor service requests
  const { data: requests = [] } = useQuery<ServiceRequest[]>({
    queryKey: ['/api/vendor-service-requests'],
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

  const submitMutation = useMutation({
    mutationFn: async (data: any) => 
      apiRequest("POST", "/api/vendor-service-requests", {
        ...data,
        requesterType: 'vendor',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendor-service-requests'] });
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
      pending: Clock,
      approved: Check,
      in_progress: Wrench,
      completed: Check,
      rejected: X,
    };

    const Icon = icons[status] || Clock;
    const variant = variants[status] || "bg-gray-100 text-gray-800";

    return (
      <Badge className={`${variant} inline-flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.replace(/_/g, ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Service Requests</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your vendor service requests</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="gap-2"
          data-testid="button-new-service-request"
        >
          <Plus className="w-4 h-4" />
          New Request
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No service requests yet</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setShowForm(true)}
              >
                Create First Request
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle>{request.title}</CardTitle>
                    <CardDescription>{request.description}</CardDescription>
                  </div>
                  <div className="flex gap-2 items-center">
                    {getStatusBadge(request.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setMessageDialog(request)}
                      className="gap-2"
                      data-testid={`button-messages-${request.id}`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                {request.estimatedHours && (
                  <p>Estimated Hours: {request.estimatedHours}</p>
                )}
                {request.preferredDate && (
                  <p>Preferred Date: {request.preferredDate}</p>
                )}
                {request.rejectionReason && (
                  <p className="text-red-600 dark:text-red-400">Rejection Reason: {request.rejectionReason}</p>
                )}
                <p className="text-xs">Submitted {format(new Date(request.createdAt), 'MMM dd, yyyy')}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Request Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Service Request</DialogTitle>
            <DialogDescription>
              Describe the service you need from the admin team
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Website Development"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                data-testid="input-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what you need..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                data-testid="textarea-description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Estimated Hours</Label>
              <Input
                id="hours"
                type="number"
                step="0.5"
                placeholder="e.g., 10"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                data-testid="input-hours"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Preferred Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                data-testid="input-date"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitMutation.isPending}
                data-testid="button-submit-request"
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Messages Dialog */}
      <Dialog open={!!messageDialog} onOpenChange={() => setMessageDialog(null)}>
        <DialogContent className="max-w-2xl max-h-96 flex flex-col">
          <DialogHeader>
            <DialogTitle>Messages - {messageDialog?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {messages.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-4">No messages yet</p>
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
