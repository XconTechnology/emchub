import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LifeBuoy, Plus } from "lucide-react";
import { format } from "date-fns";
import type { SupportTicket } from "@shared/schema";
import ContactSupportForm from "@/components/ContactSupportForm";

export default function UserSupportTickets() {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ['/api/support-tickets/my-tickets'],
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
                      Created on {format(new Date(ticket.createdAt), "PPP 'at' p")}
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

      {/* Ticket Details Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-[600px]" data-testid="dialog-ticket-details">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle data-testid="title-ticket-detail">{selectedTicket.subject}</DialogTitle>
                <DialogDescription>
                  Ticket ID: {selectedTicket.id.slice(0, 8)} • Created on {format(new Date(selectedTicket.createdAt), "PPP 'at' p")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge variant={getStatusBadgeVariant(selectedTicket.status)} data-testid="badge-detail-status">
                    Status: {selectedTicket.status}
                  </Badge>
                  <Badge variant={getPriorityBadgeVariant(selectedTicket.priority || "normal")} data-testid="badge-detail-priority">
                    Priority: {selectedTicket.priority || "normal"}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Message:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap" data-testid="text-detail-message">
                    {selectedTicket.message}
                  </p>
                </div>
                {selectedTicket.assignedTo && (
                  <div>
                    <h4 className="font-semibold mb-2">Assigned To:</h4>
                    <p className="text-sm text-muted-foreground" data-testid="text-detail-assigned">
                      Staff ID: {selectedTicket.assignedTo}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold mb-2">Last Updated:</h4>
                  <p className="text-sm text-muted-foreground" data-testid="text-detail-updated">
                    {format(new Date(selectedTicket.updatedAt), "PPP 'at' p")}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Ticket Form */}
      <ContactSupportForm isOpen={showCreateForm} onClose={() => setShowCreateForm(false)} />
    </div>
  );
}
