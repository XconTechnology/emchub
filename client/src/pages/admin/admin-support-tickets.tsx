import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
import { Search, LifeBuoy, User as UserIcon, Send, Clock, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import type { SupportTicket, User } from "@shared/schema";

interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  message: string;
  createdAt: string;
  senderUsername: string;
  senderRole: string;
}

export default function AdminSupportTickets() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messageDialog, setMessageDialog] = useState<SupportTicket | null>(null);
  const quickMessagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all tickets
  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ['/api/support-tickets'],
  });

  // Fetch staff members for assignment dropdown
  const { data: vendors = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/assignable-staff'],
  });

  // Fetch all users to display usernames in ticket details
  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  // Fetch messages for view-only quick message dialog
  const { data: quickMessages = [] } = useQuery<TicketMessage[]>({
    queryKey: ['/api/support-tickets', messageDialog?.id, 'messages'],
    queryFn: async () => {
      if (!messageDialog?.id) return [];
      const response = await fetch(`/api/support-tickets/${messageDialog.id}/messages`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!messageDialog?.id,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
  });

  // Auto-scroll to bottom when new quick messages arrive
  useEffect(() => {
    quickMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [quickMessages]);

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const response = await apiRequest("PUT", `/api/support-tickets/${ticketId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      toast({
        title: "Status Updated",
        description: "Ticket status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status.",
        variant: "destructive",
      });
    },
  });

  // Update priority mutation
  const updatePriorityMutation = useMutation({
    mutationFn: async ({ ticketId, priority }: { ticketId: string; priority: string }) => {
      const response = await apiRequest("PUT", `/api/support-tickets/${ticketId}/priority`, { priority });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      toast({
        title: "Priority Updated",
        description: "Ticket priority has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update priority.",
        variant: "destructive",
      });
    },
  });

  // Assign ticket mutation
  const assignTicketMutation = useMutation({
    mutationFn: async ({ ticketId, assignedTo }: { ticketId: string; assignedTo: string | null }) => {
      const response = await apiRequest("PUT", `/api/support-tickets/${ticketId}/assign`, { assignedTo });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      toast({
        title: "Ticket Assigned",
        description: "Ticket has been assigned successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign ticket.",
        variant: "destructive",
      });
    },
  });


  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "open":
        return "default";
      case "pending":
        return "secondary";
      case "closed":
        return "outline";
      default:
        return "default";
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "destructive";
      case "normal":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="title-admin-support-tickets">
          Support Tickets
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage and respond to user support requests
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-filter-status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger data-testid="select-filter-priority">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-tickets-count">
            {filteredTickets.length} Ticket{filteredTickets.length !== 1 ? 's' : ''}
          </CardTitle>
          <CardDescription>
            {filteredTickets.length === 0 && tickets.length > 0
              ? "No tickets match your filters"
              : "View and manage all support tickets"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <LifeBuoy className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2" data-testid="text-no-tickets">
                {tickets.length === 0 ? "No support tickets yet" : "No tickets match your filters"}
              </h3>
              <p className="text-muted-foreground text-center">
                {tickets.length === 0
                  ? "Support tickets will appear here when users submit them."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => {
                    const assignedVendor = ticket.assignedTo ? vendors.find(v => v.id === ticket.assignedTo) : null;
                    return (
                    <TableRow key={ticket.id} data-testid={`row-ticket-${ticket.id}`}>
                      <TableCell className="font-mono text-xs" data-testid={`cell-id-${ticket.id}`}>
                        {ticket.id.slice(0, 8)}
                      </TableCell>
                      <TableCell data-testid={`cell-user-${ticket.id}`}>
                        {ticket.userId.slice(0, 8)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate" data-testid={`cell-subject-${ticket.id}`}>
                        {ticket.subject}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={ticket.status}
                          onValueChange={(value) =>
                            updateStatusMutation.mutate({ ticketId: ticket.id, status: value })
                          }
                        >
                          <SelectTrigger className="w-32" data-testid={`select-status-${ticket.id}`}>
                            <Badge variant={getStatusBadgeVariant(ticket.status)}>
                              {ticket.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={ticket.priority || "normal"}
                          onValueChange={(value) =>
                            updatePriorityMutation.mutate({ ticketId: ticket.id, priority: value })
                          }
                        >
                          <SelectTrigger className="w-32" data-testid={`select-priority-${ticket.id}`}>
                            <Badge variant={getPriorityBadgeVariant(ticket.priority || "normal")}>
                              {ticket.priority || "normal"}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={ticket.assignedTo || "unassigned"}
                          onValueChange={(value) => {
                            assignTicketMutation.mutate({
                              ticketId: ticket.id,
                              assignedTo: value === "unassigned" ? null : value,
                            });
                          }}
                        >
                          <SelectTrigger className="w-48" data-testid={`select-assign-${ticket.id}`}>
                            <SelectValue placeholder="Unassigned">
                              {assignedVendor ? `${assignedVendor.username}` : "Unassigned"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {vendors.map((vendor) => (
                              <SelectItem key={vendor.id} value={vendor.id}>
                                {vendor.username} - {(vendor as any).businessName || 'Vendor'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm" data-testid={`cell-created-${ticket.id}`}>
                        {ticket.createdAt ? format(new Date(ticket.createdAt), "PP") : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTicket(ticket)}
                            data-testid={`button-view-${ticket.id}`}
                          >
                            View
                          </Button>
                          {ticket.assignedTo && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setMessageDialog(ticket)}
                              data-testid={`button-view-messages-${ticket.id}`}
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              View Messages
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Details Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col" data-testid="dialog-ticket-details">
          {selectedTicket && (() => {
            const ticketUser = allUsers.find(u => u.id === selectedTicket.userId);
            const assignedVendor = selectedTicket.assignedTo ? vendors.find(v => v.id === selectedTicket.assignedTo) : null;
            
            return (
              <>
                <DialogHeader>
                  <DialogTitle data-testid="title-ticket-detail">Support Ticket Details</DialogTitle>
                  <DialogDescription>
                    Ticket ID: {selectedTicket.id.slice(0, 8)}
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-6">
                  {/* User Information */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      User Information
                    </h3>
                    <div className="text-sm">
                      <div>
                        <span className="text-muted-foreground">Username:</span>
                        <p className="font-medium" data-testid="text-username">
                          {ticketUser?.username || 'Unknown User'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Information */}
                  <div>
                    <h3 className="font-semibold text-sm mb-3">Ticket Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-muted-foreground text-sm">Subject:</span>
                        <p className="font-semibold text-lg" data-testid="text-subject">{selectedTicket.subject}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">Issue Type / Category:</span>
                        <p className="font-medium mt-1" data-testid="text-issue-type">
                          {selectedTicket.issueType ? 
                            selectedTicket.issueType
                              .split('-')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' ')
                            : 'General Inquiry'}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-sm">Message:</span>
                        <p className="text-sm mt-1 whitespace-pre-wrap bg-muted/30 p-3 rounded-md" data-testid="text-message">
                          {selectedTicket.message}
                        </p>
                      </div>
                      {selectedTicket.attachmentUrl && (
                        <div>
                          <span className="text-muted-foreground text-sm">Attachment:</span>
                          <div className="mt-1">
                            <a
                              href={selectedTicket.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
                              data-testid="link-attachment"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                              </svg>
                              View Attachment
                            </a>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-muted-foreground text-sm">Status:</span>
                          <div className="mt-1">
                            <Badge variant={getStatusBadgeVariant(selectedTicket.status)} data-testid="badge-status">
                              {selectedTicket.status}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-sm">Priority:</span>
                          <div className="mt-1">
                            <Badge variant={getPriorityBadgeVariant(selectedTicket.priority || "normal")} data-testid="badge-priority">
                              {selectedTicket.priority || "normal"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assignment & Dates */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Assigned To:</span>
                      <p className="font-medium mt-1" data-testid="text-assigned-vendor">
                        {assignedVendor 
                          ? `${assignedVendor.username} (${(assignedVendor as any).businessName || 'Vendor'})` 
                          : 'Unassigned'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <p className="font-medium mt-1" data-testid="text-created">
                        {selectedTicket.createdAt ? format(new Date(selectedTicket.createdAt), "PPP 'at' p") : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Updated:</span>
                      <p className="font-medium mt-1" data-testid="text-updated">
                        {selectedTicket.updatedAt ? format(new Date(selectedTicket.updatedAt), "PPP 'at' p") : 'N/A'}
                      </p>
                    </div>
                  </div>

                  </div>
                </ScrollArea>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* View Conversation Dialog */}
      <Dialog 
        open={!!messageDialog} 
        onOpenChange={() => setMessageDialog(null)}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col" data-testid="dialog-quick-message">
          {messageDialog && (() => {
            const assignedVendor = messageDialog.assignedTo ? vendors.find(v => v.id === messageDialog.assignedTo) : null;
            
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    View Conversation
                  </DialogTitle>
                  <DialogDescription>
                    Viewing conversation between user and {assignedVendor?.username} about: {messageDialog.subject}
                  </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-[400px] border rounded-lg p-4 bg-muted/20">
                    <div className="space-y-4">
                      {quickMessages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8 text-sm">
                          <p>No messages yet. Send the first message to start the conversation.</p>
                        </div>
                      ) : (
                        quickMessages.map((msg) => {
                          const isAdmin = msg.senderRole === 'admin' || msg.senderRole === 'super-admin';

                          return (
                            <div
                              key={msg.id}
                              className="space-y-1"
                              data-testid={`quick-message-${msg.id}`}
                            >
                              <div className="flex items-center gap-2 text-xs">
                                {isAdmin && <Badge className="text-xs" variant="destructive">Admin</Badge>}
                                {!isAdmin && (
                                  <>
                                    <UserIcon className="w-3 h-3" />
                                    <span className="font-semibold">
                                      {msg.senderUsername}
                                    </span>
                                  </>
                                )}
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                                </span>
                              </div>
                              <div
                                className={`rounded-lg px-4 py-2 ${
                                  isAdmin
                                    ? 'bg-primary text-primary-foreground ml-0'
                                    : 'bg-muted ml-8'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={quickMessagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* View-Only Information Banner */}
                  <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                    <p className="text-xs text-blue-800 dark:text-blue-200 text-center">
                      ℹ️ Administrators have view-only access to monitor conversations between users and staff.
                    </p>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
