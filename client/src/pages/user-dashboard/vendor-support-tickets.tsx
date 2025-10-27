import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LifeBuoy, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import type { SupportTicket } from "@shared/schema";
import { Link } from "wouter";

export default function VendorSupportTickets() {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Fetch assigned tickets
  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ['/api/support-tickets/vendor/assigned'],
  });

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
                  <Link href={`/dashboard/vendor-support-tickets/${ticket.id}`}>
                    <Button variant="default" size="sm" data-testid={`button-view-${ticket.id}`}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      View & Reply
                    </Button>
                  </Link>
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
    </div>
  );
}
