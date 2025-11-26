import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Wrench, MessageSquare, Check, X, Clock } from "lucide-react";
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
  requesterName: string;
  adminName: string | null;
}

export default function AdminServiceRequests() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [messageDialog, setMessageDialog] = useState<ServiceRequest | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);

  const { data: requests = [], isLoading } = useQuery<ServiceRequest[]>({
    queryKey: ['/api/admin/service-requests'],
  });

  const { data: messages = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/service-requests', messageDialog?.id, 'messages'],
    queryFn: async () => {
      if (!messageDialog?.id) return [];
      const response = await fetch(`/api/admin/service-requests/${messageDialog.id}/messages`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!messageDialog?.id,
    refetchInterval: 3000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/admin/service-requests/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/service-requests'] });
      toast({ title: "Status updated successfully" });
      setSelectedRequest(null);
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return apiRequest("PATCH", `/api/admin/service-requests/${id}`, {
        status: 'rejected',
        rejectionReason: reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/service-requests'] });
      toast({ title: "Request rejected" });
      setShowRejectionDialog(false);
      setRejectionReason("");
      setSelectedRequest(null);
    },
    onError: () => {
      toast({ title: "Failed to reject request", variant: "destructive" });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ id, message }: { id: string; message: string }) => {
      return apiRequest("POST", `/api/admin/service-requests/${id}/messages`, { message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/service-requests', messageDialog?.id, 'messages'] });
      setNewMessage("");
      toast({ title: "Message sent" });
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    },
  });

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.requesterName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
      <Badge className={variants[status] || variants.pending} data-testid={`badge-status-${status}`}>
        <span className="flex items-center gap-1">
          {icons[status]}
          {status.replace('_', ' ')}
        </span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
          Service Requests
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage service requests from users and vendors
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by title or requester..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Requests</CardTitle>
          <CardDescription>
            {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No service requests found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id} data-testid={`row-request-${request.id}`}>
                      <TableCell className="font-medium">{request.title}</TableCell>
                      <TableCell>{request.requesterName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.requesterType}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>{format(new Date(request.createdAt), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                            data-testid={`button-view-${request.id}`}
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMessageDialog(request)}
                            data-testid={`button-message-${request.id}`}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Request Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedRequest?.title}</DialogTitle>
            <DialogDescription>
              Service request from {selectedRequest?.requesterName}
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
                      {selectedRequest.preferredDate || 'Not specified'}
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

              <DialogFooter className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Close
                </Button>
                {selectedRequest.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => {
                        updateStatusMutation.mutate({
                          id: selectedRequest.id,
                          status: 'approved',
                        });
                      }}
                      disabled={updateStatusMutation.isPending}
                      data-testid="button-approve"
                    >
                      {updateStatusMutation.isPending ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setShowRejectionDialog(true)}
                      data-testid="button-reject"
                    >
                      Reject
                    </Button>
                  </>
                )}
                {selectedRequest.status === 'approved' && (
                  <Button
                    onClick={() => {
                      updateStatusMutation.mutate({
                        id: selectedRequest.id,
                        status: 'in_progress',
                      });
                    }}
                    disabled={updateStatusMutation.isPending}
                    data-testid="button-start-work"
                  >
                    Start Work
                  </Button>
                )}
                {selectedRequest.status === 'in_progress' && (
                  <Button
                    onClick={() => {
                      updateStatusMutation.mutate({
                        id: selectedRequest.id,
                        status: 'completed',
                      });
                    }}
                    disabled={updateStatusMutation.isPending}
                    data-testid="button-complete"
                  >
                    Mark Complete
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Service Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this request
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            data-testid="textarea-rejection-reason"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectionDialog(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedRequest) {
                  rejectMutation.mutate({
                    id: selectedRequest.id,
                    reason: rejectionReason,
                  });
                }
              }}
              disabled={rejectMutation.isPending}
              data-testid="button-confirm-reject"
            >
              Reject
            </Button>
          </DialogFooter>
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
