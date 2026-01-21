import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MessageSquare, Mail, CheckCircle, Eye } from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface ContactQuery {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function AdminQueries() {
  const { toast } = useToast();
  const [selectedQuery, setSelectedQuery] = useState<ContactQuery | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const { data: queries, isLoading } = useQuery<ContactQuery[]>({
    queryKey: ["/api/admin/contact-queries"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest(
        "PATCH",
        `/api/admin/contact-queries/${id}/status`,
        { status }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-queries"] });
      toast({
        title: "Status Updated",
        description: "Query status has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update query status",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="destructive">New</Badge>;
      case "read":
        return <Badge variant="secondary">Read</Badge>;
      case "replied":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Replied
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewQuery = (query: ContactQuery) => {
    setSelectedQuery(query);
    setViewDialogOpen(true);
    if (query.status === "new") {
      updateStatusMutation.mutate({ id: query.id, status: "read" });
    }
  };

  const handleMarkAsReplied = (id: string) => {
    updateStatusMutation.mutate({ id, status: "replied" });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  const newCount = queries?.filter((q) => q.status === "new").length || 0;
  const repliedCount = queries?.filter((q) => q.status === "replied").length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Contact Queries
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage contact form submissions from the About page
        </p>
      </div>

      {/* ✅ UPDATED: Removed "Read" Card */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Queries</CardTitle>
            <MessageSquare className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{newCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replied</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{repliedCount}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Queries</CardTitle>
        </CardHeader>
        <CardContent>
          {queries && queries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queries.map((query) => (
                  <TableRow
                    key={query.id}
                    className={
                      query.status === "new"
                        ? "bg-red-50 dark:bg-red-900/10"
                        : ""
                    }
                  >
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(query.createdAt), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="font-medium">{query.name}</TableCell>
                    <TableCell>
                      <a
                        href={`mailto:${query.email}`}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Mail className="w-3 h-3" />
                        {query.email}
                      </a>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {query.subject}
                    </TableCell>
                    <TableCell>{getStatusBadge(query.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewQuery(query)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>

                        {query.status !== "replied" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleMarkAsReplied(query.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Mark Replied
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No contact queries yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Query Details</DialogTitle>
            <DialogDescription>
              Submitted on{" "}
              {selectedQuery &&
                format(
                  new Date(selectedQuery.createdAt),
                  "MMMM dd, yyyy 'at' HH:mm"
                )}
            </DialogDescription>
          </DialogHeader>

          {selectedQuery && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Name
                  </label>
                  <p className="text-lg">{selectedQuery.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="text-lg">
                    <a
                      href={`mailto:${selectedQuery.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {selectedQuery.email}
                    </a>
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Subject
                </label>
                <p className="text-lg">{selectedQuery.subject}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Message
                </label>
                <div className="mt-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedQuery.message}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <div>{getStatusBadge(selectedQuery.status)}</div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(
                        `mailto:${selectedQuery.email}?subject=Re: ${encodeURIComponent(
                          selectedQuery.subject
                        )}`,
                        "_blank"
                      )
                    }
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Reply via Email
                  </Button>

                  {selectedQuery.status !== "replied" && (
                    <Button
                      onClick={() => {
                        handleMarkAsReplied(selectedQuery.id);
                        setViewDialogOpen(false);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Replied
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
