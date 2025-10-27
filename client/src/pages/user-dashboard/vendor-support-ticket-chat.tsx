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
import { ArrowLeft, Send, User as UserIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { Link, useParams } from "wouter";
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

export default function VendorSupportTicketChat() {
  const { id: ticketId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch ticket details
  const { data: ticket, isLoading: ticketLoading } = useQuery<SupportTicket>({
    queryKey: ['/api/support-tickets', ticketId],
    enabled: !!ticketId,
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
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets/vendor/assigned'] });
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
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

  if (ticketLoading || messagesLoading) {
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
            The ticket you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link href="/dashboard/vendor-support-tickets">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tickets
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/vendor-support-tickets">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tickets
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="title-ticket-chat">
          {ticket.subject}
        </h1>
        <div className="flex flex-wrap gap-2 items-center mt-2">
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

      {/* Original Issue */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Original Issue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{ticket.message}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Created {ticket.createdAt ? format(new Date(ticket.createdAt), "PPP 'at' p") : 'N/A'}
          </p>
        </CardContent>
      </Card>

      {/* Messages Thread */}
      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
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
                          <UserIcon className="w-3 h-3" />
                          <span className="text-xs font-semibold">
                            {msg.senderUsername}
                            {isAdmin && <Badge className="ml-1 text-xs" variant="destructive">Admin</Badge>}
                          </span>
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
              disabled={ticket.status === 'closed' || sendMessageMutation.isPending}
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
                {ticket.status === 'closed' 
                  ? 'This ticket is closed. Messages cannot be sent.'
                  : 'Press Enter to send, Shift+Enter for new line'
                }
              </p>
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || ticket.status === 'closed' || sendMessageMutation.isPending}
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4 mr-2" />
                {sendMessageMutation.isPending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
