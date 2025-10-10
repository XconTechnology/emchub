import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { HelpCircle, UserCheck, CheckCircle, Clock, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { StaffHelpRequest } from "@shared/schema";

export default function AdminStaffHelp() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  const [completingRequest, setCompletingRequest] = useState<StaffHelpRequest | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");

  const { data: allRequests = [], isLoading } = useQuery<StaffHelpRequest[]>({
    queryKey: ["/api/admin/staff-help"],
  });

  const assignMutation = useMutation({
    mutationFn: async (id: string) => apiRequest(`/api/admin/staff-help/${id}/assign`, "PUT"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/staff-help"] });
      toast({ title: "Request assigned to you" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to assign request", description: error.message, variant: "destructive" });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) =>
      apiRequest(`/api/admin/staff-help/${id}/complete`, "PUT", { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/staff-help"] });
      toast({ title: "Request marked as completed" });
      setCompletingRequest(null);
      setCompletionNotes("");
    },
    onError: (error: any) => {
      toast({ title: "Failed to complete request", description: error.message, variant: "destructive" });
    },
  });

  const handleComplete = () => {
    if (!completingRequest) return;
    if (!completionNotes.trim()) {
      toast({
        title: "Completion notes required",
        description: "Please provide notes about how you helped the user",
        variant: "destructive",
      });
      return;
    }
    completeMutation.mutate({ id: completingRequest.id, notes: completionNotes });
  };

  const pendingRequests = allRequests.filter(r => r.status === 'pending');
  const inProgressRequests = allRequests.filter(r => r.status === 'in_progress');
  const completedRequests = allRequests.filter(r => r.status === 'completed');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500 hover:bg-blue-600"><UserCheck className="w-3 h-3 mr-1" />In Progress</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "cancelled":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getListingTypeLabel = (type: string) => {
    switch (type) {
      case 'business': return 'Business Listing';
      case 'product': return 'Product';
      case 'service': return 'Service';
      case 'event': return 'Event';
      default: return type;
    }
  };

  const renderRequestCard = (request: StaffHelpRequest) => (
    <Card key={request.id} data-testid={`card-request-${request.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-lg">{getListingTypeLabel(request.listingType)} Help Request</CardTitle>
              {getStatusBadge(request.status)}
            </div>
            <CardDescription>
              User: <strong>{request.userName}</strong> • Requested: {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
            </CardDescription>
          </div>
          {request.status === 'pending' && (
            <Button
              size="sm"
              onClick={() => assignMutation.mutate(request.id)}
              disabled={assignMutation.isPending}
              data-testid={`button-assign-${request.id}`}
            >
              <UserCheck className="w-4 h-4 mr-1" />
              Assign to Me
            </Button>
          )}
          {request.status === 'in_progress' && (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setCompletingRequest(request)}
              data-testid={`button-complete-${request.id}`}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Mark Complete
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {request.message && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">User's Message:</p>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg border">
                {request.message}
              </p>
            </div>
          )}
          {request.status === 'completed' && request.responseNotes && (
            <div className="pt-3 border-t">
              <p className="text-sm font-semibold text-gray-700 mb-1">Staff Response:</p>
              <p className="text-sm text-gray-600 p-3 bg-green-50 rounded-lg border border-green-200">
                {request.responseNotes}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Completed: {request.updatedAt ? new Date(request.updatedAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p>Loading staff help requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Staff Help Requests</h2>
        <p className="text-gray-600">Manage user assistance requests</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedRequests.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" data-testid="tab-all">
            All ({allRequests.length})
          </TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="in_progress" data-testid="tab-in-progress">
            In Progress ({inProgressRequests.length})
          </TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">
            Completed ({completedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {allRequests.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No help requests found</p>
              </CardContent>
            </Card>
          ) : (
            allRequests.map(renderRequestCard)
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingRequests.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No pending requests</p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map(renderRequestCard)
          )}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4 mt-6">
          {inProgressRequests.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No requests in progress</p>
              </CardContent>
            </Card>
          ) : (
            inProgressRequests.map(renderRequestCard)
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedRequests.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No completed requests</p>
              </CardContent>
            </Card>
          ) : (
            completedRequests.map(renderRequestCard)
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!completingRequest} onOpenChange={() => setCompletingRequest(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Complete Help Request</DialogTitle>
            <DialogDescription>
              Provide notes about how you assisted the user
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="completion-notes">Response Notes*</Label>
              <Textarea
                id="completion-notes"
                data-testid="textarea-completion-notes"
                placeholder="Describe how you helped the user and what was done..."
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCompletingRequest(null);
                setCompletionNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleComplete}
              disabled={completeMutation.isPending}
              data-testid="button-confirm-complete"
            >
              {completeMutation.isPending ? "Saving..." : "Mark as Complete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
