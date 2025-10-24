import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Loader2, Store } from "lucide-react";
import ChatBox from "@/components/ChatBox";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { queryClient } from "@/lib/queryClient";
import type { Conversation } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function VendorMessages() {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { subscribe } = useWebSocket();

  // Fetch all conversations for the vendor
  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
    enabled: !!user,
  });

  // Subscribe to WebSocket for real-time updates
  useEffect(() => {
    const unsubscribe = subscribe('new_message', () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    });

    return () => unsubscribe();
  }, [subscribe]);

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  if (!user) {
    return null;
  }

  // Only show if user is a vendor
  if (user.vendorStatus !== 'verified') {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Vendor Access Required</h3>
          <p className="text-muted-foreground">
            You need to be a verified vendor to access this feature.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="heading-vendor-messages">
          Vendor Messages
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          View and respond to customer inquiries about your products
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Customer Inquiries
              {conversations.length > 0 && (
                <Badge variant="secondary" data-testid="badge-conversation-count">
                  {conversations.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 px-4" data-testid="text-no-conversations">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  No customer inquiries yet
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  When customers message you about your products, they will appear here
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="divide-y">
                  {conversations.map((conversation) => {
                    const unreadCount = conversation.unreadByVendor || 0;
                    const isSelected = selectedConversationId === conversation.id;

                    return (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedConversationId(conversation.id)}
                        className={`w-full text-left p-4 hover:bg-muted transition-colors ${
                          isSelected ? 'bg-muted' : ''
                        }`}
                        data-testid={`conversation-item-${conversation.id}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-sm truncate" data-testid={`conversation-product-${conversation.id}`}>
                                {conversation.productTitle || "General Inquiry"}
                              </h4>
                              {unreadCount > 0 && (
                                <Badge variant="destructive" className="text-xs" data-testid={`badge-unread-${conversation.id}`}>
                                  {unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Customer inquiry
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 truncate" data-testid={`conversation-last-message-${conversation.id}`}>
                              {conversation.lastMessage || "No messages yet"}
                            </p>
                            {conversation.lastMessageAt && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Chat Box */}
        <div className="lg:col-span-2">
          {selectedConversation && selectedConversationId ? (
            <ChatBox
              conversationId={selectedConversationId}
              currentUserId={user.id}
              onConversationUpdate={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
              }}
            />
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center text-muted-foreground" data-testid="text-select-conversation">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to start chatting</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
