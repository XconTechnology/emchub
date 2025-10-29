import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LifeBuoy, Plus, Send, MessageSquare, Loader2, User as UserIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { SupportTicket } from "@shared/schema";
import ContactSupportForm from "@/components/ContactSupportForm";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  receiverId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  senderUsername: string;
  senderRole: string;
}

export default function UserSupportTickets() {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ['/api/support-tickets/my-tickets'],
  });

  // Fetch ticket messages when a ticket is selected
  const { data: messages = [], isLoading: messagesLoading } = useQuery<TicketMessage[]>({
    queryKey: ['/api/support-tickets', selectedTicket?.id, 'messages'],
    queryFn: async () => {
      const response = await fetch(`/api/support-tickets/${selectedTicket?.id}/messages`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!selectedTicket?.id,
    refetchInterval: selectedTicket ? 3000 : false, // Auto-refresh every 3 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", `/api/support-tickets/${selectedTicket?.id}/messages`, { 
        message 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets', selectedTicket?.id, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets/my-tickets'] });
      setMessageText("");
      toast({
        title: "Message Sent",
        description: "Your message has been sent to support staff.",
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
    if (selectedTicket) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedTicket]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    sendMessageMutation.mutate(messageText);
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
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="title-my-support-tickets">
            My Support Tickets
          </h1>
          <p className="text-muted-foreground mt-1">
            View and track your support requests
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} data-testid="button-create-ticket">
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <LifeBuoy className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2" data-testid="text-no-tickets">No support tickets yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven't submitted any support tickets. Need help?
            </p>
            <Button onClick={() => setShowCreateForm(true)} data-testid="button-create-first-ticket">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Ticket
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedTicket(ticket)}
              data-testid={`card-ticket-${ticket.id}`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg" data-testid={`title-ticket-${ticket.id}`}>
                      {ticket.subject}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Created on {ticket.createdAt ? format(new Date(ticket.createdAt), "PPP 'at' p") : 'N/A'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getStatusBadgeVariant(ticket.status)} data-testid={`badge-status-${ticket.id}`}>
                      {ticket.status}
                    </Badge>
                    <Badge variant={getPriorityBadgeVariant(ticket.priority || "normal")} data-testid={`badge-priority-${ticket.id}`}>
                      {ticket.priority || "normal"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-message-${ticket.id}`}>
                  {ticket.message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Ticket Details Dialog with Messages */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-[800px] h-[85vh] flex flex-col p-0" data-testid="dialog-ticket-details">
          {selectedTicket && (
            <>
              <div className="px-6 pt-6">
                <DialogHeader>
                  <DialogTitle data-testid="title-ticket-detail">{selectedTicket.subject}</DialogTitle>
                  <DialogDescription>
                    Ticket ID: {selectedTicket.id.slice(0, 8)} • Created on {selectedTicket.createdAt ? format(new Date(selectedTicket.createdAt), "PPP 'at' p") : 'N/A'}
                  </DialogDescription>
                </DialogHeader>
              </div>

              <ScrollArea className="flex-1 px-6">
                <div className="space-y-4 pb-4">
                  {/* Ticket Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Ticket Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Badge variant={getStatusBadgeVariant(selectedTicket.status)} data-testid="badge-detail-status">
                          {selectedTicket.status}
                        </Badge>
                        <Badge variant={getPriorityBadgeVariant(selectedTicket.priority || "normal")} data-testid="badge-detail-priority">
                          {selectedTicket.priority || "normal"}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Original Message:</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap" data-testid="text-detail-message">
                          {selectedTicket.message}
                        </p>
                      </div>
                      {selectedTicket.assignedTo ? (
                        <p className="text-sm text-muted-foreground">
                          ✓ Assigned to support staff
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          ⏳ Waiting for assignment
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Messages Thread */}
                  {selectedTicket.assignedTo && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Conversation with Support Staff
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <ScrollArea className="h-[350px] pr-4 border rounded-lg p-4 bg-muted/20">
                          <div className="space-y-4">
                            {messagesLoading ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                              </div>
                            ) : messages.length === 0 ? (
                              <div className="text-center text-muted-foreground py-8">
                                <p>No messages yet. Send the first message to start the conversation.</p>
                              </div>
                            ) : (
                              messages.map((msg) => {
                                const isCurrentUser = msg.senderRole !== 'staff';

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
                                          {msg.senderRole === 'staff' && <Badge className="ml-1 text-xs" variant="secondary">Staff</Badge>}
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

                        {/* Message Input */}
                        <div className="space-y-2">
                          <Textarea
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Type your message to support staff..."
                            rows={3}
                            disabled={selectedTicket.status === 'closed' || sendMessageMutation.isPending}
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
                              {selectedTicket.status === 'closed' 
                                ? 'This ticket is closed. Messages cannot be sent.'
                                : 'Press Enter to send, Shift+Enter for new line'
                              }
                            </p>
                            <Button
                              onClick={handleSendMessage}
                              disabled={!messageText.trim() || selectedTicket.status === 'closed' || sendMessageMutation.isPending}
                              data-testid="button-send-message"
                              size="sm"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              {sendMessageMutation.isPending ? "Sending..." : "Send"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {!selectedTicket.assignedTo && (
                    <Card className="bg-muted">
                      <CardContent className="pt-6">
                        <p className="text-sm text-center text-muted-foreground">
                          Your ticket is waiting to be assigned to a support staff member. You'll be able to chat once it's assigned.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Ticket Form */}
      <ContactSupportForm isOpen={showCreateForm} onClose={() => setShowCreateForm(false)} />
    </div>
  );
}
