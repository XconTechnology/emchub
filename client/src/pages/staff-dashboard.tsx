import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Loader2, Ticket, AlertCircle, LogOut, Send, User as UserIcon, Clock, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useActivity } from "@/contexts/ActivityContext";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  staffRole?: string;
}

interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    username: string;
    email: string;
  };
}

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

export default function StaffDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [quickMessageTicket, setQuickMessageTicket] = useState<SupportTicket | null>(null);
  const [message, setMessage] = useState("");
  const [quickMessage, setQuickMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/me"],
  });

  const { data: assignedTickets, isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/support-tickets/vendor/assigned"],
    enabled: user?.role === "staff",
  });

  const isActive = useActivity();
  // Fetch ticket messages when a ticket is selected (stops after 1 min inactivity)
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
    refetchInterval: selectedTicket && isActive ? 3000 : false,
  });

  // Send message mutation for full chat
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await apiRequest("POST", `/api/support-tickets/${selectedTicket?.id}/messages`, { 
        message: messageText 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets', selectedTicket?.id, 'messages'] });
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

  // Send quick message mutation
  const sendQuickMessageMutation = useMutation({
    mutationFn: async ({ ticketId, messageText }: { ticketId: string; messageText: string }) => {
      const response = await apiRequest("POST", `/api/support-tickets/${ticketId}/messages`, { 
        message: messageText 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets/vendor/assigned'] });
      setQuickMessage("");
      setQuickMessageTicket(null);
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the user.",
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
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  const handleSendQuickMessage = () => {
    if (!quickMessage.trim() || !quickMessageTicket) return;
    sendQuickMessageMutation.mutate({
      ticketId: quickMessageTicket.id,
      messageText: quickMessage,
    });
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      window.location.href = "/staff-login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "normal":
        return "bg-blue-500";
      case "low":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-500";
      case "assigned":
        return "bg-blue-500";
      case "pending":
        return "bg-yellow-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!user || user.role !== "staff") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <p className="text-center text-lg font-semibold">Access Denied</p>
              <p className="text-center text-sm text-muted-foreground">
                You must be logged in as a staff member to access this page.
              </p>
              <Button onClick={() => navigate("/staff-login")} data-testid="button-go-to-login">
                Go to Staff Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Staff Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Welcome, {user.username}!
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>

          {/* Assigned Tickets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                My Assigned Tickets
              </CardTitle>
              <CardDescription>
                Support tickets assigned to you by administrators
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : assignedTickets && assignedTickets.length > 0 ? (
                <div className="space-y-4">
                  {assignedTickets.map((ticket) => (
                    <Card
                      key={ticket.id}
                      className="hover:shadow-md transition-shadow"
                      data-testid={`card-ticket-${ticket.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg" data-testid={`text-subject-${ticket.id}`}>
                                {ticket.subject}
                              </h3>
                              <Badge className={getPriorityColor(ticket.priority)} data-testid={`badge-priority-${ticket.id}`}>
                                {ticket.priority}
                              </Badge>
                              <Badge className={getStatusColor(ticket.status)} data-testid={`badge-status-${ticket.id}`}>
                                {ticket.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2" data-testid={`text-message-${ticket.id}`}>
                              {ticket.message}
                            </p>
                            {ticket.user && (
                              <p className="text-xs text-gray-500" data-testid={`text-user-${ticket.id}`}>
                                From: {ticket.user.username} ({ticket.user.email})
                              </p>
                            )}
                            <p className="text-xs text-gray-400" data-testid={`text-created-${ticket.id}`}>
                              Created: {new Date(ticket.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setQuickMessageTicket(ticket);
                              }}
                              data-testid={`button-message-${ticket.id}`}
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Message
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTicket(ticket);
                              }}
                              data-testid={`button-view-${ticket.id}`}
                            >
                              View Chat
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No tickets assigned to you yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Message Dialog */}
      <Dialog open={!!quickMessageTicket} onOpenChange={() => setQuickMessageTicket(null)}>
        <DialogContent className="sm:max-w-[500px]" data-testid="dialog-quick-message">
          <DialogHeader>
            <DialogTitle>Send Quick Message</DialogTitle>
          </DialogHeader>
          {quickMessageTicket && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-semibold">{quickMessageTicket.subject}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  To: {quickMessageTicket.user?.username || 'Unknown User'}
                </p>
              </div>
              <Textarea
                value={quickMessage}
                onChange={(e) => setQuickMessage(e.target.value)}
                placeholder="Type your message to the user..."
                rows={4}
                disabled={sendQuickMessageMutation.isPending}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendQuickMessage();
                  }
                }}
                data-testid="textarea-quick-message"
                className="resize-none"
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  Press Enter to send, Shift+Enter for new line
                </p>
                <Button
                  onClick={handleSendQuickMessage}
                  disabled={!quickMessage.trim() || sendQuickMessageMutation.isPending}
                  data-testid="button-send-quick-message"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sendQuickMessageMutation.isPending ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Full Chat Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh]" data-testid="dialog-view-chat">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.subject}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              {/* Ticket Info */}
              <div className="bg-muted p-4 rounded-md space-y-2">
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(selectedTicket.priority)}>
                    {selectedTicket.priority}
                  </Badge>
                  <Badge className={getStatusColor(selectedTicket.status)}>
                    {selectedTicket.status}
                  </Badge>
                </div>
                <p className="text-sm font-semibold">Original Issue:</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedTicket.message}
                </p>
                {selectedTicket.user && (
                  <p className="text-xs text-muted-foreground">
                    User: {selectedTicket.user.username} ({selectedTicket.user.email})
                  </p>
                )}
              </div>

              {/* Messages */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Conversation
                </h3>
                <ScrollArea className="h-[300px] pr-4 border rounded-md p-4">
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
                        const isStaff = msg.senderRole === 'staff';

                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}
                            data-testid={`message-${msg.id}`}
                          >
                            <div className={`max-w-[70%] ${isStaff ? 'text-right' : 'text-left'}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <UserIcon className="w-3 h-3" />
                                <span className="text-xs font-semibold">
                                  {msg.senderUsername}
                                  {isStaff && <Badge className="ml-1 text-xs" variant="secondary">Staff</Badge>}
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                                </span>
                              </div>
                              <div
                                className={`rounded-lg px-4 py-2 ${
                                  isStaff
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
              </div>

              <Separator />

              {/* Message Input */}
              <div className="space-y-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message to the user..."
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
                    disabled={!message.trim() || selectedTicket.status === 'closed' || sendMessageMutation.isPending}
                    data-testid="button-send-message"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {sendMessageMutation.isPending ? "Sending..." : "Send"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
