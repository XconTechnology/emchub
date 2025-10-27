import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Ticket, User, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SupportTicket, User as UserType } from "@shared/schema";
import { format } from "date-fns";

type TicketWithUser = SupportTicket & {
  user?: UserType;
  assignedStaff?: UserType;
};

export default function AdminSupportTickets() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<TicketWithUser | null>(null);
  const { toast } = useToast();

  const { data: tickets, isLoading } = useQuery<TicketWithUser[]>({
    queryKey: ['/api/admin/support/tickets'],
  });

  const { data: staff } = useQuery<UserType[]>({
    queryKey: ['/api/admin/staff'],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      return apiRequest('PATCH', `/api/admin/support/tickets/${ticketId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "Ticket status has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/support/tickets'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    },
  });

  const assignStaffMutation = useMutation({
    mutationFn: async ({ ticketId, staffId }: { ticketId: string; staffId: string }) => {
      return apiRequest('PATCH', `/api/admin/support/tickets/${ticketId}/assign`, { 
        assignedTo: staffId 
      });
    },
    onSuccess: () => {
      toast({
        title: "Staff assigned",
        description: "Ticket has been assigned successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/support/tickets'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign staff to ticket",
        variant: "destructive",
      });
    },
  });

  const filteredTickets = tickets?.filter((ticket) => {
    if (statusFilter === "all") return true;
    return ticket.status === statusFilter;
  }) || [];

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Support Tickets</h2>
          <p className="text-muted-foreground">
            Manage and respond to user support tickets
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Filter by Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="filter-status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mt-8">
                {filteredTickets.length} {filteredTickets.length === 1 ? "ticket" : "tickets"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Support Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12" data-testid="empty-state">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-600">
                {statusFilter === "all" 
                  ? "No support tickets have been submitted yet"
                  : `No ${statusFilter} tickets found`
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow 
                      key={ticket.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedTicket(ticket)}
                      data-testid={`row-ticket-${ticket.id}`}
                    >
                      <TableCell className="font-mono text-xs">
                        {ticket.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-medium max-w-xs truncate">
                        {ticket.subject}
                      </TableCell>
                      <TableCell>
                        {ticket.user?.username || "Unknown"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={ticket.assignedTo || "unassigned"}
                          onValueChange={(staffId) => {
                            if (staffId !== "unassigned") {
                              assignStaffMutation.mutate({ 
                                ticketId: ticket.id, 
                                staffId 
                              });
                            }
                          }}
                          disabled={assignStaffMutation.isPending}
                        >
                          <SelectTrigger 
                            className="w-[150px]"
                            data-testid={`select-assign-${ticket.id}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <SelectValue placeholder="Unassigned" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {staff?.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.username}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={ticket.status}
                          onValueChange={(status) => {
                            updateStatusMutation.mutate({ 
                              ticketId: ticket.id, 
                              status 
                            });
                          }}
                          disabled={updateStatusMutation.isPending}
                        >
                          <SelectTrigger 
                            className="w-[120px]"
                            data-testid={`button-update-status-${ticket.id}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Details Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
            <DialogDescription>
              View full ticket information and user message
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Ticket ID</label>
                  <p className="font-mono text-sm">{selectedTicket.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedTicket.status)}>
                      {selectedTicket.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">User</label>
                  <p>{selectedTicket.user?.username || "Unknown"}</p>
                  <p className="text-sm text-gray-500">{selectedTicket.user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created</label>
                  <p>{format(new Date(selectedTicket.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Subject</label>
                <p className="text-lg font-semibold mt-1">{selectedTicket.subject}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Message</label>
                <div className="mt-1 p-4 bg-gray-50 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
