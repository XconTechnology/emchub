import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/use-websocket";
import type { Message, Conversation } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface ChatBoxProps {
  conversationId: string;
  currentUserId: string;
  onConversationUpdate?: () => void;
}

export default function ChatBox({ conversationId, currentUserId, onConversationUpdate }: ChatBoxProps) {
  const [messageText, setMessageText] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { subscribe } = useWebSocket();

  // Fetch conversation details
  const { data: conversation } = useQuery<Conversation>({
    queryKey: [`/api/conversations/${conversationId}`],
    enabled: !!conversationId,
  });

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: [`/api/conversations/${conversationId}/messages`],
    enabled: !!conversationId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest('POST', `/api/conversations/${conversationId}/messages`, {
        message,
      });
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${conversationId}/messages`] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/unread/count'] });
      if (onConversationUpdate) {
        onConversationUpdate();
      }
    },
  });

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('PUT', `/api/conversations/${conversationId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/unread/count'] });
      if (onConversationUpdate) {
        onConversationUpdate();
      }
    },
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Mark as read when conversation is opened
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      const hasUnreadMessages = messages.some(msg => !msg.isRead && msg.senderId !== currentUserId);
      if (hasUnreadMessages) {
        markAsReadMutation.mutate();
      }
    }
  }, [conversationId, messages.length]);

  // Subscribe to WebSocket for real-time updates
  useEffect(() => {
    const unsubscribe = subscribe('new_message', (data: any) => {
      if (data.data?.conversationId === conversationId) {
        queryClient.invalidateQueries({ queryKey: [`/api/conversations/${conversationId}/messages`] });
        queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
        
        // Mark as read if we're viewing this conversation
        if (data.data?.senderId !== currentUserId) {
          markAsReadMutation.mutate();
        }
      }
    });

    return () => unsubscribe();
  }, [conversationId, currentUserId, subscribe]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      sendMessageMutation.mutate(messageText.trim());
    }
  };

  const isCustomer = conversation?.customerId === currentUserId;
  const otherUserName = isCustomer 
    ? "Vendor" 
    : "Customer";

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg" data-testid="chat-title">
              {conversation?.productTitle ? `Re: ${conversation.productTitle}` : "Conversation"}
            </CardTitle>
            {conversation?.productTitle && (
              <p className="text-sm text-muted-foreground mt-1">
                with {otherUserName}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <Separator />
      
      {/* Messages Area */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea ref={scrollAreaRef} className="h-full p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8" data-testid="text-no-messages">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message) => {
                  const isSent = message.senderId === currentUserId;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                      data-testid={`message-${message.id}`}
                    >
                      <div className={`max-w-[70%] ${isSent ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            isSent
                              ? 'bg-[#8FC24C] text-white'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          <p className="text-sm break-words">{message.message}</p>
                        </div>
                        <div className="flex items-center gap-2 px-1">
                          <span className="text-xs text-muted-foreground">
                            {message.senderRole === 'vendor' ? 'Vendor' : 'Customer'}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {message.createdAt ? formatDistanceToNow(new Date(message.createdAt), { addSuffix: true }) : 'Just now'}
                          </span>
                          {!message.isRead && !isSent && (
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      <Separator />

      {/* Message Input */}
      <CardContent className="p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            disabled={sendMessageMutation.isPending}
            data-testid="input-message"
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!messageText.trim() || sendMessageMutation.isPending}
            data-testid="button-send-message"
            className="bg-[#8FC24C] hover:bg-[#7AB23C]"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
