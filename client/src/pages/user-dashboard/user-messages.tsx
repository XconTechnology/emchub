import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Inbox, Send, Archive, MessageSquare, Paperclip, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function UserMessages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [activeTab, setActiveTab] = useState("inbox");

  // Fetch conversations
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["/api/conversations"],
    enabled: !!user,
  });

  // Fetch messages for selected conversation
  const { data: messages = [] } = useQuery({
    queryKey: ["/api/conversations", selectedConversation?.id, "messages"],
    enabled: !!selectedConversation,
  });

  // Fetch unread count
  const { data: unreadData } = useQuery({
    queryKey: ["/api/messages/unread/count"],
    enabled: !!user,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const conversation = selectedConversation;
      const receiverId = conversation.vendorId === user?.id 
        ? conversation.customerId 
        : conversation.vendorId;

      const res = await apiRequest("POST", `/api/conversations/${conversation.id}/messages`, {
        receiverId,
        content,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation?.id, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setMessageText("");
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Archive conversation mutation
  const archiveConversationMutation = useMutation({
    mutationFn: async ({ conversationId, archive }: { conversationId: string; archive: boolean }) => {
      const res = await apiRequest("PUT", `/api/conversations/${conversationId}/archive`, { archive });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setSelectedConversation(null);
      toast({
        title: "Conversation archived",
        description: "The conversation has been moved to archives.",
      });
    },
  });

  // Filter conversations based on active tab
  const filteredConversations = conversations.filter((conv: any) => {
    const isVendor = conv.vendorId === user?.id;
    const isArchived = isVendor ? conv.isArchivedByVendor : conv.isArchivedByCustomer;
    
    if (activeTab === "archived") {
      return isArchived;
    }
    
    if (isArchived) return false;
    
    if (activeTab === "inbox") {
      // Messages received by current user
      return conv.customerId === user?.id || conv.vendorId === user?.id;
    }
    
    if (activeTab === "sent") {
      // Messages sent by current user (where they initiated)
      return true; // All non-archived conversations
    }
    
    return true;
  });

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    sendMessageMutation.mutate(messageText);
  };

  const handleArchive = (conversationId: string) => {
    archiveConversationMutation.mutate({ conversationId, archive: true });
  };

  const getOtherUser = (conversation: any) => {
    return conversation.vendorId === user?.id ? conversation.customer : conversation.vendor;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="page-messages">
      <div>
        <h1 className="text-3xl font-bold" data-testid="heading-messages">Messages</h1>
        <p className="text-muted-foreground">Communicate with vendors and customers</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inbox" data-testid="tab-inbox">
            <Inbox className="w-4 h-4 mr-2" />
            Inbox
            {unreadData?.count > 0 && (
              <Badge variant="destructive" className="ml-2" data-testid="badge-unread-count">
                {unreadData.count}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" data-testid="tab-sent">
            <Send className="w-4 h-4 mr-2" />
            Sent
          </TabsTrigger>
          <TabsTrigger value="archived" data-testid="tab-archived">
            <Archive className="w-4 h-4 mr-2" />
            Archived
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredConversations.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2" data-testid="text-no-messages">No messages</h3>
                <p className="text-muted-foreground">
                  {activeTab === "inbox" && "You don't have any messages yet."}
                  {activeTab === "sent" && "You haven't sent any messages yet."}
                  {activeTab === "archived" && "No archived conversations."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-2">
                {filteredConversations.map((conv: any) => {
                  const otherUser = getOtherUser(conv);
                  return (
                    <Card
                      key={conv.id}
                      className={`cursor-pointer transition-colors hover:bg-accent ${
                        selectedConversation?.id === conv.id ? "bg-accent" : ""
                      }`}
                      onClick={() => setSelectedConversation(conv)}
                      data-testid={`conversation-${conv.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold truncate" data-testid={`text-conversation-user-${conv.id}`}>
                                {otherUser?.username || otherUser?.firstName || "Unknown User"}
                              </h4>
                              <span className="text-xs text-muted-foreground" data-testid={`text-conversation-time-${conv.id}`}>
                                {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conv.subject || `Re: ${conv.relatedType || "General"}`}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="lg:col-span-2">
                {selectedConversation ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle data-testid="text-conversation-title">
                            {getOtherUser(selectedConversation)?.username || "Unknown User"}
                          </CardTitle>
                          <CardDescription>
                            {selectedConversation.subject || `Re: ${selectedConversation.relatedType || "General"}`}
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleArchive(selectedConversation.id)}
                          data-testid="button-archive-conversation"
                        >
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3 max-h-96 overflow-y-auto" data-testid="messages-list">
                        {messages.map((msg: any) => {
                          const isSent = msg.senderId === user?.id;
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                              data-testid={`message-${msg.id}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                  isSent
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                <p className="text-sm" data-testid={`text-message-content-${msg.id}`}>{msg.content}</p>
                                {msg.attachmentUrl && (
                                  <div className="mt-2 flex items-center gap-2 text-xs opacity-80">
                                    <Paperclip className="w-3 h-3" />
                                    <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="underline">
                                      Attachment
                                    </a>
                                  </div>
                                )}
                                <div className="text-xs mt-1 opacity-70" data-testid={`text-message-time-${msg.id}`}>
                                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-2">
                        <Textarea
                          placeholder="Type your message..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          className="min-h-24"
                          data-testid="input-message"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={handleSendMessage}
                            disabled={!messageText.trim() || sendMessageMutation.isPending}
                            data-testid="button-send-message"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            {sendMessageMutation.isPending ? "Sending..." : "Send"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                      <p className="text-muted-foreground">
                        Choose a conversation from the list to view and reply to messages
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
