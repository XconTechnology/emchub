import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Ticket, AlertCircle, LogOut, Send, User as UserIcon, Clock, MessageSquare, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  message: string;
  createdAt: string;
  senderUsername: string;
  senderRole: string;
}

interface Conversation {
  id: string;
  customerId: string;
  vendorId: string;
  productId?: string;
  productTitle?: string;
  lastMessageAt: string;
  lastMessage?: string;
  unreadByCustomer: number;
  unreadByVendor: number;
  createdAt: string;
  customer?: {
    id: string;
    username: string;
    email: string;
  };
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    username: string;
  };
}

export default function StaffDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [quickMessageTicket, setQuickMessageTicket] = useState<SupportTicket | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState("");
  const [quickMessage, setQuickMessage] = useState("");
  const [conversationMessage, setConversationMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationMessagesEndRef = useRef<HTMLDivElement>(null);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/me"],
  });

  const { data: assignedTickets, isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/support-tickets/vendor/assigned"],
    enabled: user?.role === "staff",
  });

  // Fetch conversations (staff acts as vendor)
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations/vendor"],
    enabled: user?.role === "staff",
  });

  // Fetch conversation messages
  const { data: conversationMessages = [], isLoading: conversationMessagesLoading } = useQuery<Message[]>({
    queryKey: ['/api/conversations', selectedConversation?.id, 'messages'],
    queryFn: async () => {
      const response = await fetch(`/api/conversations/${selectedConversation?.id}/messages`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
    enabled: !!selectedConversation?.id,
    refetchInterval: selectedConversation ? 3000 : false,
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
    refetchInterval: selectedTicket ? 3000 : false,
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

  // Send conversation message mutation
  const sendConversationMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await apiRequest("POST", `/api/conversations/${selectedConversation?.id}/messages`, { 
        message: messageText 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', selectedConversation?.id, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations/vendor'] });
      setConversationMessage("");
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
    if (selectedTicket) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedTicket]);

  // Auto-scroll for conversation messages
  useEffect(() => {
    if (selectedConversation) {
      conversationMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversationMessages, selectedConversation]);

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

  const handleSendConversationMessage = () => {
    if (!conversationMessage.trim()) return;
    sendConversationMessageMutation.mutate(conversationMessage);
  };

  const handleMarkAsRead = async (conversationId: string) => {
    try {
      await apiRequest("POST", `/api/conversations/${conversationId}/mark-read`, {});
      queryClient.invalidateQueries({ queryKey: ['/api/conversations/vendor'] });
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
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
      case "pending":
        return "bg-yellow-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
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

          {/* Tabs Section */}
          <Tabs defaultValue="tickets" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tickets" data-testid="tab-assigned-tickets">
                <Ticket className="h-4 w-4 mr-2" />
                Assigned Tickets
              </TabsTrigger>
              <TabsTrigger value="messages" data-testid="tab-messages">
                <Mail className="h-4 w-4 mr-2" />
                Messages
                {conversations.filter(c => c.unreadByVendor > 0).length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {conversations.filter(c => c.unreadByVendor > 0).length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Assigned Tickets Tab */}
            <TabsContent value="tickets">
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
                      <Ticket className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-4 text-gray-600 dark:text-gray-400">
                        No tickets assigned to you yet.
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Assigned tickets will appear here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    User Messages
                  </CardTitle>
                  <CardDescription>
                    Messages from users who submitted support tickets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {conversationsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : conversations.length > 0 ? (
                    <div className="space-y-4">
                      {conversations.map((conversation) => (
                        <Card
                          key={conversation.id}
                          className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => {
                            setSelectedConversation(conversation);
                            handleMarkAsRead(conversation.id);
                          }}
                          data-testid={`card-conversation-${conversation.id}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-lg" data-testid={`text-conversation-title-${conversation.id}`}>
                                    {conversation.productTitle || 'Support'}
                                  </h3>
                                  {conversation.unreadByVendor > 0 && (
                                    <Badge variant="destructive" data-testid={`badge-unread-${conversation.id}`}>
                                      {conversation.unreadByVendor} unread
                                    </Badge>
                                  )}
                                </div>
                                {conversation.customer && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`text-customer-${conversation.id}`}>
                                    With: {conversation.customer.username} ({conversation.customer.email})
                                  </p>
                                )}
                                {conversation.lastMessage && (
                                  <p className="text-sm text-gray-500 line-clamp-1" data-testid={`text-last-message-${conversation.id}`}>
                                    {conversation.lastMessage}
                                  </p>
                                )}
                                <p className="text-xs text-gray-400" data-testid={`text-last-message-at-${conversation.id}`}>
                                  {new Date(conversation.lastMessageAt).toLocaleString()}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedConversation(conversation);
                                  handleMarkAsRead(conversation.id);
                                }}
                                data-testid={`button-view-conversation-${conversation.id}`}
                              >
                                View Chat
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Mail className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-4 text-gray-600 dark:text-gray-400">
                        No messages yet.
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Messages from users will appear here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Quick Message Dialog */}
      <Dialog open={!!quickMessageTicket} onOpenChange={(open) => !open && setQuickMessageTicket(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle data-testid="dialog-title-quick-message">Send Message to User</DialogTitle>
          </DialogHeader>
          {quickMessageTicket && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-semibold">{quickMessageTicket.subject}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  To: {quickMessageTicket.user?.username} ({quickMessageTicket.user?.email})
                </p>
              </div>
              <Textarea
                value={quickMessage}
                onChange={(e) => setQuickMessage(e.target.value)}
                placeholder="Type your message to the user..."
                rows={4}
                disabled={quickMessageTicket.status === 'closed' || sendQuickMessageMutation.isPending}
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
                  {quickMessageTicket.status === 'closed' 
                    ? 'This ticket is closed. Messages cannot be sent.'
                    : 'Press Enter to send, Shift+Enter for new line'
                  }
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setQuickMessageTicket(null)}
                    data-testid="button-cancel-quick-message"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendQuickMessage}
                    disabled={!quickMessage.trim() || quickMessageTicket.status === 'closed' || sendQuickMessageMutation.isPending}
                    data-testid="button-send-quick-message"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {sendQuickMessageMutation.isPending ? "Sending..." : "Send"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Full Chat Dialog Modal */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl" data-testid="dialog-title-ticket-chat">
              {selectedTicket?.subject}
            </DialogTitle>
            {selectedTicket && (
              <div className="flex flex-wrap gap-2 items-center mt-2">
                <Badge variant={getStatusBadgeVariant(selectedTicket.status)} data-testid="dialog-badge-status">
                  {selectedTicket.status}
                </Badge>
                <Badge variant={getPriorityBadgeVariant(selectedTicket.priority || "normal")} data-testid="dialog-badge-priority">
                  {selectedTicket.priority || "normal"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ID: {selectedTicket.id.slice(0, 8)}
                </span>
              </div>
            )}
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4 mt-4">
              {/* Original Issue */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Original Issue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
                  {selectedTicket.user && (
                    <p className="text-xs text-muted-foreground mt-2">
                      From: {selectedTicket.user.username} ({selectedTicket.user.email})
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Created {selectedTicket.createdAt ? format(new Date(selectedTicket.createdAt), "PPP 'at' p") : 'N/A'}
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
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Conversation Chat Dialog */}
      <Dialog open={!!selectedConversation} onOpenChange={(open) => !open && setSelectedConversation(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl" data-testid="dialog-title-conversation-chat">
              {selectedConversation?.productTitle || 'Support Conversation'}
            </DialogTitle>
            {selectedConversation?.customer && (
              <p className="text-sm text-muted-foreground mt-2">
                With: {selectedConversation.customer.username} ({selectedConversation.customer.email})
              </p>
            )}
          </DialogHeader>

          {selectedConversation && (
            <div className="space-y-4 mt-4">
              {/* Messages Thread */}
              <Card>
                <CardHeader>
                  <CardTitle>Conversation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {conversationMessagesLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                        </div>
                      ) : conversationMessages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          <p>No messages yet. Send the first message to start the conversation.</p>
                        </div>
                      ) : (
                        conversationMessages.map((msg) => {
                          const isCurrentUser = msg.senderId === user?.id;

                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                              data-testid={`conversation-message-${msg.id}`}
                            >
                              <div className={`max-w-[70%] ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <UserIcon className="w-3 h-3" />
                                  <span className="text-xs font-semibold">
                                    {msg.sender?.username || 'Unknown'}
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
                      <div ref={conversationMessagesEndRef} />
                    </div>
                  </ScrollArea>

                  <Separator className="my-4" />

                  {/* Message Input */}
                  <div className="space-y-2">
                    <Textarea
                      value={conversationMessage}
                      onChange={(e) => setConversationMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={3}
                      disabled={sendConversationMessageMutation.isPending}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendConversationMessage();
                        }
                      }}
                      data-testid="textarea-conversation-message"
                      className="resize-none"
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        Press Enter to send, Shift+Enter for new line
                      </p>
                      <Button
                        onClick={handleSendConversationMessage}
                        disabled={!conversationMessage.trim() || sendConversationMessageMutation.isPending}
                        data-testid="button-send-conversation-message"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {sendConversationMessageMutation.isPending ? "Sending..." : "Send"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
