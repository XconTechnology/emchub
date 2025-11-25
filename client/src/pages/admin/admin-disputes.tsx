import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AlertTriangle, Calendar, Clock, User, CheckCircle, XCircle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface Dispute {
  id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  mediatorId?: string;
  reason: string;
  status: string;
  resolutionNote?: string;
  deadline: string;
  createdAt: string;
  buyerName: string;
  sellerName: string;
  mediatorName?: string;
}

export default function AdminDisputes() {
  const { toast } = useToast();
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");

  // Fetch all disputes
  const { data: disputes, isLoading } = useQuery<Dispute[]>({
    queryKey: ['/api/admin/disputes'],
  });

  // Resolve dispute mutation
  const resolveDisputeMutation = useMutation({
    mutationFn: async ({ disputeId, status, resolution }: { disputeId: string; status: string; resolution: string }) => {
      return apiRequest('PATCH', `/api/disputes/${disputeId}/status`, {
        status,
        resolution,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/disputes'] });
      setResolveDialogOpen(false);
      setSelectedDispute(null);
      setResolutionStatus("");
      setResolutionNote("");
      toast({
        title: "Dispute Updated",
        description: "The dispute has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update dispute",
        variant: "destructive",
      });
    },
  });

  const handleResolveDispute = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setResolutionStatus(dispute.status);
    setResolutionNote(dispute.resolutionNote || "");
    setResolveDialogOpen(true);
  };

  const handleSubmitResolution = () => {
    if (!selectedDispute || !resolutionStatus || !resolutionNote.trim()) {
      toast({
        title: "Error",
        description: "Please provide status and resolution notes",
        variant: "destructive",
      });
      return;
    }

    resolveDisputeMutation.mutate({
      disputeId: selectedDispute.id,
      status: resolutionStatus,
      resolution: resolutionNote,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getDaysRemaining = (deadline: string) => {
    const daysLeft = differenceInDays(new Date(deadline), new Date());
    return daysLeft;
  };

  const getDeadlineColor = (daysLeft: number) => {
    if (daysLeft < 0) return 'text-red-600 dark:text-red-400';
    if (daysLeft <= 5) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading disputes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dispute Management</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and resolve TimeDollar disputes between buyers and sellers
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{disputes?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {disputes?.filter(d => d.status === 'open').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {disputes?.filter(d => d.status === 'in_progress').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {disputes?.filter(d => d.status === 'resolved').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disputes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Disputes</CardTitle>
        </CardHeader>
        <CardContent>
          {!disputes || disputes.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Disputes Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                All disputes will appear here for review and resolution
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dispute ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Mediator</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disputes.map((dispute) => {
                  const daysLeft = getDaysRemaining(dispute.deadline);
                  return (
                    <TableRow key={dispute.id} data-testid={`row-dispute-${dispute.id}`}>
                      <TableCell className="font-mono text-sm">{dispute.id.slice(0, 8)}...</TableCell>
                      <TableCell className="font-mono text-sm">{dispute.orderId.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{dispute.buyerName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{dispute.sellerName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {dispute.mediatorName ? (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-400" />
                            <span className="text-sm">{dispute.mediatorName}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(dispute.status)}>
                          {dispute.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {format(new Date(dispute.deadline), 'MMM dd, yyyy')}
                          </div>
                          <div className={`text-xs font-semibold ${getDeadlineColor(daysLeft)}`}>
                            {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(dispute.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolveDispute(dispute)}
                          data-testid={`button-resolve-${dispute.id}`}
                        >
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Resolve Dispute Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent className="sm:max-w-[600px]" data-testid="dialog-resolve-dispute">
          <DialogHeader>
            <DialogTitle>Manage Dispute</DialogTitle>
            <DialogDescription>
              Update the dispute status and provide resolution notes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedDispute && (
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="font-medium">Dispute ID:</span> {selectedDispute.id.slice(0, 8)}...</div>
                  <div><span className="font-medium">Order ID:</span> {selectedDispute.orderId.slice(0, 8)}...</div>
                  <div><span className="font-medium">Buyer:</span> {selectedDispute.buyerName}</div>
                  <div><span className="font-medium">Seller:</span> {selectedDispute.sellerName}</div>
                </div>
                <div>
                  <span className="font-medium">Reason:</span> {selectedDispute.reason}
                </div>
                <div>
                  <span className="font-medium">Deadline:</span> {format(new Date(selectedDispute.deadline), 'PPP')} 
                  <span className={`ml-2 font-semibold ${getDeadlineColor(getDaysRemaining(selectedDispute.deadline))}`}>
                    ({getDaysRemaining(selectedDispute.deadline)} days {getDaysRemaining(selectedDispute.deadline) >= 0 ? 'left' : 'overdue'})
                  </span>
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="resolution-status">Dispute Status *</Label>
              <Select value={resolutionStatus} onValueChange={setResolutionStatus}>
                <SelectTrigger id="resolution-status" className="mt-1" data-testid="select-resolution-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="resolution-note">Resolution Notes *</Label>
              <Textarea
                id="resolution-note"
                placeholder="Provide details about the resolution..."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                rows={5}
                className="mt-1"
                data-testid="textarea-resolution-note"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setResolveDialogOpen(false);
                setSelectedDispute(null);
                setResolutionStatus("");
                setResolutionNote("");
              }}
              data-testid="button-cancel-resolution"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitResolution}
              disabled={resolveDisputeMutation.isPending || !resolutionStatus || !resolutionNote.trim()}
              data-testid="button-submit-resolution"
            >
              {resolveDisputeMutation.isPending ? "Updating..." : "Update Dispute"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
