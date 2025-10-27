import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, LifeBuoy } from "lucide-react";
import { format } from "date-fns";
import type { SupportTicket, User } from "@shared/schema";

export default function AdminSupportTickets() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Fetch all tickets
  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ['/api/support-tickets'],
  });

  // Fetch verified vendors for assignment dropdown
  const { data: vendors = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/vendors'],
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const response = await apiRequest("PUT", `/api/support-tickets/${ticketId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      toast({
        title: "Status Updated",
        description: "Ticket status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status.",
        variant: "destructive",
      });
    },
  });

  // Update priority mutation
  const updatePriorityMutation = useMutation({
    mutationFn: async ({ ticketId, priority }: { ticketId: string; priority: string }) => {
      const response = await apiRequest("PUT", `/api/support-tickets/${ticketId}/priority`, { priority });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      toast({
        title: "Priority Updated",
        description: "Ticket priority has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update priority.",
        variant: "destructive",
      });
    },
  });

  // Assign ticket mutation
  const assignTicketMutation = useMutation({
    mutationFn: async ({ ticketId, assignedTo }: { ticketId: string; assignedTo: string | null }) => {
      const response = await apiRequest("PUT", `/api/support-tickets/${ticketId}/assign`, { assignedTo });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      toast({
        title: "Ticket Assigned",
        description: "Ticket has been assigned successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign ticket.",
        variant: "destructive",
      });
    },
  });

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="title-admin-support-tickets">
          Support Tickets
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage and respond to user support requests
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-filter-status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger data-testid="select-filter-priority">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-tickets-count">
            {filteredTickets.length} Ticket{filteredTickets.length !== 1 ? 's' : ''}
          </CardTitle>
          <CardDescription>
            {filteredTickets.length === 0 && tickets.length > 0
              ? "No tickets match your filters"
              : "View and manage all support tickets"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <LifeBuoy className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2" data-testid="text-no-tickets">
                {tickets.length === 0 ? "No support tickets yet" : "No tickets match your filters"}
              </h3>
              <p className="text-muted-foreground text-center">
                {tickets.length === 0
                  ? "Support tickets will appear here when users submit them."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} data-testid={`row-ticket-${ticket.id}`}>
                      <TableCell className="font-mono text-xs" data-testid={`cell-id-${ticket.id}`}>
                        {ticket.id.slice(0, 8)}
                      </TableCell>
                      <TableCell data-testid={`cell-user-${ticket.id}`}>
                        {ticket.userId.slice(0, 8)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate" data-testid={`cell-subject-${ticket.id}`}>
                        {ticket.subject}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={ticket.status}
                          onValueChange={(value) =>
                            updateStatusMutation.mutate({ ticketId: ticket.id, status: value })
                          }
                        >
                          <SelectTrigger className="w-32" data-testid={`select-status-${ticket.id}`}>
                            <Badge variant={getStatusBadgeVariant(ticket.status)}>
                              {ticket.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={ticket.priority || "normal"}
                          onValueChange={(value) =>
                            updatePriorityMutation.mutate({ ticketId: ticket.id, priority: value })
                          }
                        >
                          <SelectTrigger className="w-32" data-testid={`select-priority-${ticket.id}`}>
                            <Badge variant={getPriorityBadgeVariant(ticket.priority || "normal")}>
                              {ticket.priority || "normal"}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={ticket.assignedTo || "unassigned"}
                          onValueChange={(value) =>
                            assignTicketMutation.mutate({
                              ticketId: ticket.id,
                              assignedTo: value === "unassigned" ? null : value,
                            })
                          }
                        >
                          <SelectTrigger className="w-48" data-testid={`select-assign-${ticket.id}`}>
                            <SelectValue placeholder="Unassigned" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {vendors.map((vendor) => (
                              <SelectItem key={vendor.id} value={vendor.id}>
                                {vendor.username} - {vendor.businessName || 'Vendor'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm" data-testid={`cell-created-${ticket.id}`}>
                        {format(new Date(ticket.createdAt), "PP")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // View ticket details - could open a dialog
                            toast({
                              title: ticket.subject,
                              description: ticket.message,
                            });
                          }}
                          data-testid={`button-view-${ticket.id}`}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
