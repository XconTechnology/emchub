import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Flag, AlertCircle, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Report, User as UserType } from "@shared/schema";
import { format } from "date-fns";

type ReportWithDetails = Report & {
  reporter?: UserType;
  reportedItem?: { title?: string; businessName?: string };
};

export default function AdminReports() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<ReportWithDetails | null>(null);
  const [actionTaken, setActionTaken] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("open");
  const { toast } = useToast();

  const { data: reports, isLoading } = useQuery<ReportWithDetails[]>({
    queryKey: ['/api/admin/reports'],
  });

  const updateReportMutation = useMutation({
    mutationFn: async ({ reportId, status, actionTaken }: { 
      reportId: string; 
      status: string;
      actionTaken?: string;
    }) => {
      return apiRequest('PATCH', `/api/admin/reports/${reportId}`, { 
        status,
        actionTaken 
      });
    },
    onSuccess: () => {
      toast({
        title: "Report updated",
        description: "Report has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/reports'] });
      setSelectedReport(null);
      setActionTaken("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive",
      });
    },
  });

  const filteredReports = reports?.filter((report) => {
    if (statusFilter !== "all" && report.status !== statusFilter) return false;
    if (typeFilter !== "all" && report.reportedItemType !== typeFilter) return false;
    return true;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      fraud: "Fraud or Scam",
      spam: "Spam",
      inappropriate: "Inappropriate Content",
      other: "Other",
    };
    return labels[reason] || reason;
  };

  const handleOpenDialog = (report: ReportWithDetails) => {
    setSelectedReport(report);
    setSelectedStatus(report.status);
    setActionTaken(report.actionTaken || "");
  };

  const handleUpdateReport = () => {
    if (!selectedReport) return;
    
    updateReportMutation.mutate({
      reportId: selectedReport.id,
      status: selectedStatus,
      actionTaken: actionTaken || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">
            Review and manage user-reported content
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="filter-report-status">
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
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger data-testid="filter-item-type">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mt-8">
                {filteredReports.length} {filteredReports.length === 1 ? "report" : "reports"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5" />
            Content Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12" data-testid="empty-state">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-600">
                No reports match your current filters
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report ID</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Reported Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow 
                      key={report.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleOpenDialog(report)}
                      data-testid={`row-report-${report.id}`}
                    >
                      <TableCell className="font-mono text-xs">
                        {report.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        {report.reporter?.username || "Unknown"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {report.reportedItem?.title || 
                         report.reportedItem?.businessName || 
                         report.reportedItemId.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {report.reportedItemType}
                        </Badge>
                      </TableCell>
                      <TableCell>{getReasonLabel(report.reason)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {format(new Date(report.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDialog(report);
                          }}
                        >
                          Review
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

      {/* Report Details Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Details & Action</DialogTitle>
            <DialogDescription>
              Review the report and take appropriate action
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Report ID</label>
                  <p className="font-mono text-sm">{selectedReport.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Current Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedReport.status)}>
                      {selectedReport.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Reporter</label>
                  <p>{selectedReport.reporter?.username || "Unknown"}</p>
                  <p className="text-sm text-gray-500">{selectedReport.reporter?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created</label>
                  <p>{format(new Date(selectedReport.createdAt), "MMM d, yyyy 'at' h:mm a")}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Reported Item Type</label>
                  <p className="capitalize">{selectedReport.reportedItemType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Reported Item</label>
                  <p className="truncate">
                    {selectedReport.reportedItem?.title || 
                     selectedReport.reportedItem?.businessName || 
                     "Unknown"}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Reason</label>
                <p className="font-semibold mt-1">{getReasonLabel(selectedReport.reason)}</p>
              </div>
              
              {selectedReport.details && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Additional Details</label>
                  <div className="mt-1 p-4 bg-gray-50 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedReport.details}</p>
                  </div>
                </div>
              )}

              {selectedReport.ticketId && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Related Ticket</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-sm">{selectedReport.ticketId}</span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Update Status
                </label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Action Taken (Optional)
                </label>
                <Textarea
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="Describe what action was taken regarding this report..."
                  rows={4}
                  data-testid={`textarea-action-${selectedReport.id}`}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedReport(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateReport}
              disabled={updateReportMutation.isPending}
              data-testid={`button-close-report-${selectedReport?.id}`}
            >
              {updateReportMutation.isPending ? "Updating..." : "Update Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
