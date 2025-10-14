import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Building2, 
  Home, 
  User,
  Mail,
  Calendar,
  Download,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface VendorRequestWithUser {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  contactNumber: string;
  identificationDoc: string | null;
  businessRegistrationDoc: string | null;
  addressProofDoc: string | null;
  description: string | null;
  status: string;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  userName: string;
  userEmail: string;
}

export default function AdminVendorRequests() {
  const { toast } = useToast();
  const [requestToReject, setRequestToReject] = useState<VendorRequestWithUser | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [documentToView, setDocumentToView] = useState<{ url: string; title: string } | null>(null);

  const { data: pendingRequests = [], isLoading } = useQuery<VendorRequestWithUser[]>({
    queryKey: ['/api/admin/vendor-requests'],
    queryFn: async () => {
      const response = await fetch('/api/admin/vendor-requests?status=pending', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch vendor requests');
      return response.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/vendor-requests/${id}/approve`, {
        method: 'PATCH',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to approve vendor request');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/vendor-requests'] });
      toast({
        title: "Vendor approved!",
        description: "The vendor has been verified and can now create listings.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to approve vendor request",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await fetch(`/api/admin/vendor-requests/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reject vendor request');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/vendor-requests'] });
      toast({
        title: "Request rejected",
        description: "The vendor request has been rejected.",
      });
      setRequestToReject(null);
      setRejectionReason("");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to reject vendor request",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReject = () => {
    if (!requestToReject || !rejectionReason.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a rejection reason",
      });
      return;
    }
    rejectMutation.mutate({ id: requestToReject.id, reason: rejectionReason });
  };

  const handleDownload = async (requestId: string, docType: string, fileName: string) => {
    try {
      const response = await fetch(`/api/admin/vendor-requests/${requestId}/document/${docType}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download document. Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vendor Requests</h1>
        <p className="text-muted-foreground mt-2">
          Review and approve vendor verification requests
        </p>
      </div>

      <Separator />

      {pendingRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <CardTitle className="mb-2">No Pending Requests</CardTitle>
            <CardDescription>
              There are no vendor verification requests waiting for review.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pendingRequests.map((request) => (
            <Card key={request.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl" data-testid={`vendor-request-${request.id}`}>
                      {request.businessName}
                    </CardTitle>
                    <CardDescription className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span data-testid={`vendor-username-${request.id}`}>{request.userName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span data-testid={`vendor-email-${request.id}`}>{request.userEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {request.businessType === 'company' ? <Building2 className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                        <span className="capitalize">{request.businessType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>{request.contactNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Requested: {formatDate(request.createdAt)}</span>
                      </div>
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-4">
                {request.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Reason for Application:</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      {request.description}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-3">Uploaded Documents:</h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {request.identificationDoc && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium">ID Document</p>
                            <p className="text-xs text-gray-500">Identification</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setDocumentToView({ 
                              url: `/api/admin/vendor-requests/${request.id}/document/id`, 
                              title: 'ID Document' 
                            })}
                            data-testid={`button-view-id-${request.id}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDownload(request.id, 'id', 'id-document.pdf')}
                            data-testid={`button-download-id-${request.id}`}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {request.businessRegistrationDoc && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-sm font-medium">Business Reg.</p>
                            <p className="text-xs text-gray-500">Company</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setDocumentToView({ 
                              url: `/api/admin/vendor-requests/${request.id}/document/business`, 
                              title: 'Business Registration' 
                            })}
                            data-testid={`button-view-business-${request.id}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDownload(request.id, 'business', 'business-registration.pdf')}
                            data-testid={`button-download-business-${request.id}`}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {request.addressProofDoc && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Home className="w-5 h-5 text-orange-600" />
                          <div>
                            <p className="text-sm font-medium">Address Proof</p>
                            <p className="text-xs text-gray-500">Residence</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setDocumentToView({ 
                              url: `/api/admin/vendor-requests/${request.id}/document/address`, 
                              title: 'Address Proof' 
                            })}
                            data-testid={`button-view-address-${request.id}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDownload(request.id, 'address', 'address-proof.pdf')}
                            data-testid={`button-download-address-${request.id}`}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => setRequestToReject(request)}
                    data-testid={`button-reject-${request.id}`}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => approveMutation.mutate(request.id)}
                    disabled={approveMutation.isPending}
                    data-testid={`button-approve-${request.id}`}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {approveMutation.isPending ? "Approving..." : "Approve Vendor"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rejection Dialog */}
      <AlertDialog open={!!requestToReject} onOpenChange={() => setRequestToReject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Vendor Request</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this vendor request. This will be shown to the user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              data-testid="textarea-rejection-reason"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-reject">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={rejectMutation.isPending || !rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-reject"
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject Request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Document Viewer Dialog */}
      <Dialog open={!!documentToView} onOpenChange={() => setDocumentToView(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>{documentToView?.title || 'Document'}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {documentToView && (
              <iframe
                src={documentToView.url}
                className="w-full h-full border-0"
                title={documentToView.title}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
