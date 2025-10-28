import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { Loader2, Ticket, AlertCircle, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export default function StaffDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/me"],
  });

  const { data: assignedTickets, isLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/support-tickets/vendor/assigned"],
    enabled: user?.role === "staff",
  });

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

        {/* Assigned Tickets Section */}
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
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/dashboard/vendor-support-tickets/${ticket.id}`)}
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/vendor-support-tickets/${ticket.id}`);
                          }}
                          data-testid={`button-view-${ticket.id}`}
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
      </div>
    </div>
  );
}
