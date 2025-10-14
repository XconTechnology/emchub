import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HelpCircle, Clock, CheckCircle, XCircle, MessageSquare, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ContactSupportDialog from "@/components/ContactSupportDialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function UserSupport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState("");

  // Fetch user's support tickets
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["/api/support/tickets"],
    enabled: !!user,
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
        description: "Your reply has been sent successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send reply",
        variant: "destructive",
      });
    },
  });

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    sendMessageMutation.mutate(replyText);
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
        return <HelpCircle className="w-4 h-4" />;
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">Loading support tickets...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="page-support">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-support">Support Tickets</h1>
          <p className="text-muted-foreground">Manage your support requests and get help</p>
        </div>
        <ContactSupportDialog />
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <HelpCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2" data-testid="text-no-tickets">No support tickets</h3>
            <p className="text-muted-foreground mb-4">
              You haven't submitted any support requests yet.
            </p>
            <ContactSupportDialog
              triggerButton={
                <Button data-testid="button-create-first-ticket">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Create Support Ticket
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {tickets.map((ticket: any) => (
              <Card
                key={ticket.id}
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  selectedTicket?.id === ticket.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedTicket(ticket)}
                data-testid={`ticket-${ticket.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs"
                          data-testid={`badge-ticket-number-${ticket.id}`}
                        >
                          {ticket.ticketNumber}
                        </Badge>
                        <Badge
                          variant={getPriorityColor(ticket.priority) as any}
                          data-testid={`badge-priority-${ticket.id}`}
                        >
                          {ticket.priority}
                        </Badge>
                      </div>
                      <CardTitle className="text-base" data-testid={`text-ticket-subject-${ticket.id}`}>
                        {ticket.subject}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(ticket.status)}`} />
                      <span className="text-sm capitalize" data-testid={`text-ticket-status-${ticket.id}`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {ticket.description}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`text-ticket-time-${ticket.id}`}>
                    {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            {selectedTicket ? (
              <Card className="sticky top-6">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="font-mono">
                          {selectedTicket.ticketNumber}
                        </Badge>
                        <Badge variant={getPriorityColor(selectedTicket.priority) as any}>
                          {selectedTicket.priority}
                        </Badge>
                        <Badge
                          className={`${getStatusColor(selectedTicket.status)} text-white`}
                        >
                          {getStatusIcon(selectedTicket.status)}
                          <span className="ml-1 capitalize">
                            {selectedTicket.status.replace("_", " ")}
                          </span>
                        </Badge>
                      </div>
                      <CardTitle data-testid="text-selected-ticket-subject">{selectedTicket.subject}</CardTitle>
                      <CardDescription>
                        Created {formatDistanceToNow(new Date(selectedTicket.createdAt), { addSuffix: true })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">Original Message</p>
                    <p className="text-sm" data-testid="text-selected-ticket-description">
                      {selectedTicket.description}
                    </p>
                  </div>

                  {selectedTicket.messages && selectedTicket.messages.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Conversation</p>
                      <div className="space-y-2 max-h-64 overflow-y-auto" data-testid="ticket-messages-list">
                        {selectedTicket.messages.map((msg: any) => {
                          const isStaff = msg.isStaffReply;
                          return (
                            <div
                              key={msg.id}
                              className={`p-3 rounded-lg ${
                                isStaff ? "bg-primary/10" : "bg-muted"
                              }`}
                              data-testid={`ticket-message-${msg.id}`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">
                                  {isStaff ? "Support Team" : "You"}
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
                      <p className="text-sm font-medium">Add Reply</p>
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="min-h-24"
                        data-testid="input-ticket-reply"
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={handleSendReply}
                          disabled={!replyText.trim() || sendMessageMutation.isPending}
                          data-testid="button-send-ticket-reply"
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
                  <HelpCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Select a ticket</h3>
                  <p className="text-muted-foreground">
                    Choose a support ticket from the list to view details and replies
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
