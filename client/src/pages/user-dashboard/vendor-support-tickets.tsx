import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LifeBuoy, MessageSquare, Send, User as UserIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import type { SupportTicket } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  message: string;
  createdAt: string;
  senderUsername: string;
  senderRole: string;
}

export default function VendorSupportTickets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch assigned tickets
  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ['/api/support-tickets/vendor/assigned'],
  });

  // Fetch ticket messages when a ticket is selected
  const { data: messages = [] } = useQuery<TicketMessage[]>({
    queryKey: ['/api/support-tickets', selectedTicket?.id, 'messages'],
    queryFn: async () => {
      if (!selectedTicket?.id) return [];
      const response = await fetch(`/api/support-tickets/${selectedTicket.id}/messages`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!selectedTicket?.id,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
    refetchOnMount: true, // Force fresh fetch when dialog opens
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      if (!selectedTicket?.id) throw new Error("No ticket selected");
      const response = await apiRequest("POST", `/api/support-tickets/${selectedTicket.id}/messages`, { 
        message: messageText 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets', selectedTicket?.id, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets/vendor/assigned'] });
      setMessage("");
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
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="title-vendor-support-tickets">
          Assigned Support Tickets
        </h1>
        <p className="text-muted-foreground mt-1">
          View and respond to support tickets assigned to you by admins
        </p>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <LifeBuoy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Assigned Tickets</h3>
            <p className="text-muted-foreground">
              You don't have any support tickets assigned to you yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-lg transition-shadow" data-testid={`card-ticket-${ticket.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg" data-testid={`title-ticket-${ticket.id}`}>
                      {ticket.subject}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2 items-center">
                      <Badge variant={getStatusBadgeVariant(ticket.status)} data-testid={`badge-status-${ticket.id}`}>
                        {ticket.status}
                      </Badge>
                      <Badge variant={getPriorityBadgeVariant(ticket.priority || "normal")} data-testid={`badge-priority-${ticket.id}`}>
                        {ticket.priority || "normal"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {ticket.createdAt ? format(new Date(ticket.createdAt), "PPP") : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => setSelectedTicket(ticket)}
                    data-testid={`button-view-${ticket.id}`}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    View & Reply
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`message-preview-${ticket.id}`}>
                  {ticket.message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Chat Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => {
        if (!open) {
          // Clear messages cache when closing to ensure fresh data on next open
          queryClient.removeQueries({ queryKey: ['/api/support-tickets', selectedTicket?.id, 'messages'] });
          setSelectedTicket(null);
          setMessage("");
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl" data-testid="dialog-ticket-title">
              {selectedTicket?.subject}
            </DialogTitle>
            <DialogDescription>
              <div className="flex flex-wrap gap-2 items-center mt-2">
                <Badge variant={getStatusBadgeVariant(selectedTicket?.status || "open")} data-testid="dialog-badge-status">
                  {selectedTicket?.status}
                </Badge>
                <Badge variant={getPriorityBadgeVariant(selectedTicket?.priority || "normal")} data-testid="dialog-badge-priority">
                  {selectedTicket?.priority || "normal"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ID: {selectedTicket?.id.slice(0, 8)}
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {/* Original Issue */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Original Issue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{selectedTicket?.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Created {selectedTicket?.createdAt ? format(new Date(selectedTicket.createdAt), "PPP 'at' p") : 'N/A'}
                </p>
              </CardContent>
            </Card>

            {/* Messages Thread */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <h3 className="text-sm font-semibold mb-2">Conversation</h3>
              <ScrollArea className="flex-1 pr-4 border rounded-lg p-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <p>No messages yet. Send the first message to start the conversation.</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isCurrentUser = msg.senderId === user?.id;
                      const isAdmin = msg.senderRole === 'admin' || msg.senderRole === 'super-admin';

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          data-testid={`message-${msg.id}`}
                        >
                          <div className={`max-w-[70%] ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              {isAdmin && <Badge className="text-xs" variant="destructive">Admin</Badge>}
                              {!isAdmin && (
                                <>
                                  <UserIcon className="w-3 h-3" />
                                  <span className="text-xs font-semibold">
                                    {msg.senderUsername}
                                  </span>
                                </>
                              )}
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                              </span>
                            </div>
                            <div
                              className={`rounded-lg px-4 py-2 ${
                                isCurrentUser
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <Separator className="my-4" />

              {/* Message Input */}
              <div className="space-y-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={3}
                  disabled={selectedTicket?.status === 'closed' || sendMessageMutation.isPending}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  data-testid="textarea-message"
                  className="resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    {selectedTicket?.status === 'closed' 
                      ? 'This ticket is closed. Messages cannot be sent.'
                      : 'Press Enter to send, Shift+Enter for new line'
                    }
                  </p>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || selectedTicket?.status === 'closed' || sendMessageMutation.isPending}
                    data-testid="button-send-message"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {sendMessageMutation.isPending ? "Sending..." : "Send"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
