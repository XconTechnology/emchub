import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, User as UserIcon, Clock, Mail, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { Link, useParams } from "wouter";
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

export default function AdminSupportTicketDetail() {
  const { id: ticketId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch ticket details
  const { data: ticket, isLoading: ticketLoading } = useQuery<SupportTicket>({
    queryKey: ['/api/support-tickets', ticketId],
    enabled: !!ticketId,
  });

  // Fetch all users to display usernames in ticket details
  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  // Fetch verified vendors for assignment dropdown
  const { data: vendors = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/vendors'],
  });

  // Fetch ticket messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery<TicketMessage[]>({
    queryKey: ['/api/support-tickets', ticketId, 'messages'],
    queryFn: async () => {
      const response = await fetch(`/api/support-tickets/${ticketId}/messages`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!ticketId,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await apiRequest("POST", `/api/support-tickets/${ticketId}/messages`, { 
        message: messageText 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets', ticketId, 'messages'] });
      setNewMessage("");
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message.",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage);
  };

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

  if (ticketLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Ticket Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The ticket you're looking for doesn't exist.
          </p>
          <Link href="/admin/support-tickets">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tickets
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const ticketUser = allUsers.find(u => u.id === ticket.userId);
  const assignedVendor = ticket.assignedTo ? vendors.find(v => v.id === ticket.assignedTo) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/admin/support-tickets">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Tickets
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" data-testid="title-ticket-detail">
          {ticket.subject}
        </h1>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant={getStatusBadgeVariant(ticket.status)} data-testid="badge-status">
            {ticket.status}
          </Badge>
          <Badge variant={getPriorityBadgeVariant(ticket.priority || "normal")} data-testid="badge-priority">
            {ticket.priority || "normal"}
          </Badge>
          <span className="text-sm text-muted-foreground">
            ID: {ticket.id.slice(0, 8)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Ticket Details */}
        <div className="lg:col-span-1 space-y-4">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Username:</span>
                <p className="font-medium" data-testid="text-username">
                  {ticketUser?.username || 'Unknown User'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium flex items-center gap-1" data-testid="text-email">
                  <Mail className="w-3 h-3" />
                  {ticketUser?.email || 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ticket Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Assigned To:</span>
                <p className="font-medium" data-testid="text-assigned-vendor">
                  {assignedVendor 
                    ? `${assignedVendor.username} (${(assignedVendor as any).businessName || 'Vendor'})` 
                    : 'Unassigned'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>
                <p className="font-medium" data-testid="text-created">
                  {ticket.createdAt ? format(new Date(ticket.createdAt), "PPP 'at' p") : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <p className="font-medium" data-testid="text-updated">
                  {ticket.updatedAt ? format(new Date(ticket.updatedAt), "PPP 'at' p") : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Original Issue */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Original Issue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap" data-testid="text-message">{ticket.message}</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Messages */}
        <div className="lg:col-span-2">
          <Card className="h-[calc(100vh-200px)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Conversation {ticket.assignedTo ? 'with Vendor' : ''}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-[calc(100%-80px)]">
              {/* Messages Thread */}
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4">
                  {!ticket.assignedTo ? (
                    <div className="text-center text-muted-foreground py-8">
                      <p>Assign this ticket to a vendor to start messaging.</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <p>No messages yet. Send the first message to start the conversation.</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isAdmin = msg.senderRole === 'admin' || msg.senderRole === 'super-admin';

                      return (
                        <div
                          key={msg.id}
                          className="space-y-1"
                          data-testid={`admin-message-${msg.id}`}
                        >
                          <div className="flex items-center gap-2 text-xs">
                            <UserIcon className="w-3 h-3" />
                            <span className="font-semibold">
                              {msg.senderUsername}
                              {isAdmin && <Badge className="ml-1 text-xs" variant="destructive">Admin</Badge>}
                            </span>
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
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <Separator className="mb-4" />

              {/* Message Input */}
              {ticket.assignedTo && (
                <>
                  {ticket.status !== 'closed' ? (
                    <div className="space-y-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message to vendor..."
                        rows={3}
                        disabled={sendMessageMutation.isPending}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        data-testid="textarea-admin-message"
                        className="resize-none"
                      />
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                          Press Enter to send, Shift+Enter for new line
                        </p>
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || sendMessageMutation.isPending}
                          data-testid="button-send-admin-message"
                          size="sm"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {sendMessageMutation.isPending ? "Sending..." : "Send"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center">
                      This ticket is closed. Reopen it to send messages.
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
