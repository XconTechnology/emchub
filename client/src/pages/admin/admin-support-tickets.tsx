import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Ticket, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Send, 
  User,
  UserCheck
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function AdminSupportTickets() {
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  // Fetch all support tickets
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["/api/admin/support/tickets", filterStatus, filterPriority],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterPriority !== "all") params.append("priority", filterPriority);
      
      const res = await fetch(`/api/admin/support/tickets?${params}`);
      if (!res.ok) throw new Error("Failed to fetch tickets");
      return res.json();
    },
  });

  // Assign ticket mutation
  const assignTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const res = await apiRequest("POST", `/api/admin/support/tickets/${ticketId}/assign`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets", selectedTicket.id] });
      toast({
        title: "Ticket assigned",
        description: "You have been assigned to this ticket.",
      });
    },
  });

  // Update ticket status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status, priority }: { ticketId: string; status?: string; priority?: string }) => {
      const res = await apiRequest("PUT", `/api/admin/support/tickets/${ticketId}`, {
        status,
        priority,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets", selectedTicket.id] });
      toast({
        title: "Ticket updated",
        description: "The ticket has been updated successfully.",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/support/tickets/${selectedTicket.id}/messages`, {
        content,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets", selectedTicket.id] });
      setReplyText("");
      toast({
        title: "Reply sent",
        description: "Your reply has been sent to the user.",
      });
    },
  });

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    sendMessageMutation.mutate(replyText);
  };

  const handleAssign = (ticketId: string) => {
    assignTicketMutation.mutate(ticketId);
  };

  const handleUpdateStatus = (ticketId: string, status: string) => {
    updateStatusMutation.mutate({ ticketId, status });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="w-4 h-4" />;
      case "in_progress":
        return <MessageSquare className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      case "closed":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Ticket className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-500";
      case "in_progress":
        return "bg-yellow-500";
      case "resolved":
        return "bg-green-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "secondary";
    }
  };

  const openTickets = tickets.filter((t: any) => t.status === "open");
  const inProgressTickets = tickets.filter((t: any) => t.status === "in_progress");
  const resolvedTickets = tickets.filter((t: any) => t.status === "resolved");
  const closedTickets = tickets.filter((t: any) => t.status === "closed");

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">Loading support tickets...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="page-admin-support-tickets">
      <div>
        <h1 className="text-3xl font-bold" data-testid="heading-admin-support-tickets">Support Tickets</h1>
        <p className="text-muted-foreground">Manage customer support requests</p>
      </div>

      <div className="flex gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48" data-testid="select-filter-status">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-48" data-testid="select-filter-priority">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="open">
        <TabsList>
          <TabsTrigger value="open" data-testid="tab-open-tickets">
            Open ({openTickets.length})
          </TabsTrigger>
          <TabsTrigger value="in_progress" data-testid="tab-in-progress-tickets">
            In Progress ({inProgressTickets.length})
          </TabsTrigger>
          <TabsTrigger value="resolved" data-testid="tab-resolved-tickets">
            Resolved ({resolvedTickets.length})
          </TabsTrigger>
          <TabsTrigger value="closed" data-testid="tab-closed-tickets">
            Closed ({closedTickets.length})
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <TabsContent value="open">
              {openTickets.map((ticket: any) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  isSelected={selectedTicket?.id === ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                />
              ))}
            </TabsContent>

            <TabsContent value="in_progress">
              {inProgressTickets.map((ticket: any) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  isSelected={selectedTicket?.id === ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                />
              ))}
            </TabsContent>

            <TabsContent value="resolved">
              {resolvedTickets.map((ticket: any) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  isSelected={selectedTicket?.id === ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                />
              ))}
            </TabsContent>

            <TabsContent value="closed">
              {closedTickets.map((ticket: any) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  isSelected={selectedTicket?.id === ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                />
              ))}
            </TabsContent>
          </div>

          <div>
            {selectedTicket ? (
              <Card className="sticky top-6">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="font-mono" data-testid="selected-ticket-number">
                          {selectedTicket.ticketNumber}
                        </Badge>
                        <Badge variant={getPriorityColor(selectedTicket.priority) as any}>
                          {selectedTicket.priority}
                        </Badge>
                        <Badge className={`${getStatusColor(selectedTicket.status)} text-white`}>
                          {getStatusIcon(selectedTicket.status)}
                          <span className="ml-1 capitalize">
                            {selectedTicket.status.replace("_", " ")}
                          </span>
                        </Badge>
                      </div>
                      <CardTitle data-testid="selected-ticket-subject">{selectedTicket.subject}</CardTitle>
                      <CardDescription>
                        From: {selectedTicket.user?.username || selectedTicket.user?.firstName || "Unknown User"}
                        <br />
                        Created {formatDistanceToNow(new Date(selectedTicket.createdAt), { addSuffix: true })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    {!selectedTicket.assignedToId && (
                      <Button
                        size="sm"
                        onClick={() => handleAssign(selectedTicket.id)}
                        disabled={assignTicketMutation.isPending}
                        data-testid="button-assign-ticket"
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Assign to Me
                      </Button>
                    )}
                    
                    {selectedTicket.status === "open" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedTicket.id, "in_progress")}
                        disabled={updateStatusMutation.isPending}
                        data-testid="button-start-progress"
                      >
                        Start Progress
                      </Button>
                    )}
                    
                    {selectedTicket.status === "in_progress" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedTicket.id, "resolved")}
                        disabled={updateStatusMutation.isPending}
                        data-testid="button-mark-resolved"
                      >
                        Mark Resolved
                      </Button>
                    )}
                    
                    {selectedTicket.status === "resolved" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedTicket.id, "closed")}
                        disabled={updateStatusMutation.isPending}
                        data-testid="button-close-ticket"
                      >
                        Close Ticket
                      </Button>
                    )}
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">Original Message</p>
                    <p className="text-sm" data-testid="selected-ticket-description">
                      {selectedTicket.description}
                    </p>
                  </div>

                  {selectedTicket.messages && selectedTicket.messages.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Conversation</p>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedTicket.messages.map((msg: any) => {
                          const isStaff = msg.isStaffReply;
                          return (
                            <div
                              key={msg.id}
                              className={`p-3 rounded-lg ${
                                isStaff ? "bg-primary/10" : "bg-muted"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">
                                  {isStaff ? "You (Support Team)" : msg.sender?.username || "User"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-sm">{msg.content}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedTicket.status !== "closed" && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Reply to User</p>
                      <Textarea
                        placeholder="Type your reply to the user..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="min-h-24"
                        data-testid="input-admin-reply"
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={handleSendReply}
                          disabled={!replyText.trim() || sendMessageMutation.isPending}
                          data-testid="button-send-admin-reply"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {sendMessageMutation.isPending ? "Sending..." : "Send Reply"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="sticky top-6">
                <CardContent className="p-12 text-center">
                  <Ticket className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Select a ticket</h3>
                  <p className="text-muted-foreground">
                    Choose a support ticket from the list to view details and respond
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
}

function TicketCard({ 
  ticket, 
  isSelected, 
  onClick, 
  getStatusColor, 
  getPriorityColor 
}: { 
  ticket: any; 
  isSelected: boolean; 
  onClick: () => void;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
}) {
  return (
    <Card
      className={`cursor-pointer transition-colors hover:bg-accent ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onClick}
      data-testid={`admin-ticket-${ticket.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="font-mono text-xs">
                {ticket.ticketNumber}
              </Badge>
              <Badge variant={getPriorityColor(ticket.priority) as any}>
                {ticket.priority}
              </Badge>
            </div>
            <CardTitle className="text-base">{ticket.subject}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(ticket.status)}`} />
            <span className="text-sm capitalize">
              {ticket.status.replace("_", " ")}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {ticket.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User className="w-3 h-3" />
          <span>{ticket.user?.username || ticket.user?.firstName || "Unknown"}</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
        </div>
      </CardContent>
    </Card>
  );
}
