import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { HelpCircle, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RequestStaffHelpButtonProps {
  listingType: 'business' | 'product' | 'service' | 'event';
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function RequestStaffHelpButton({ listingType, variant = 'outline', size = 'default' }: RequestStaffHelpButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const requestHelpMutation = useMutation({
    mutationFn: async (data: { listingType: string; message: string }) =>
      apiRequest("/api/staff-help", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-help/user"] });
      toast({
        title: "Help request submitted",
        description: "A staff member will contact you soon to assist with your listing",
      });
      setIsOpen(false);
      setMessage("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit help request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please describe what help you need",
        variant: "destructive",
      });
      return;
    }
    requestHelpMutation.mutate({ listingType, message });
  };

  const getListingTypeLabel = () => {
    switch (listingType) {
      case 'business':
        return 'business listing';
      case 'product':
        return 'product';
      case 'service':
        return 'service';
      case 'event':
        return 'event';
      default:
        return 'listing';
    }
  };

  const handleOpenDialog = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to request staff help",
        variant: "destructive",
      });
      return;
    }
    setIsOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button 
        variant={variant} 
        size={size} 
        type="button" 
        onClick={handleOpenDialog}
        data-testid={`button-request-help-${listingType}`}
      >
        <HelpCircle className="w-4 h-4 mr-2" />
        Request Staff Help
      </Button>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Staff Assistance</DialogTitle>
          <DialogDescription>
            Need help creating your {getListingTypeLabel()}? Our staff will contact you to assist.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="help-message">What do you need help with?*</Label>
            <Textarea
              id="help-message"
              data-testid="textarea-help-message"
              placeholder="Please describe what you need help with. For example: I need help uploading images, filling out the form, or understanding the requirements."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              A staff member will review your request and contact you to provide assistance.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              setMessage("");
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={requestHelpMutation.isPending}
            data-testid="button-submit-help-request"
          >
            <Send className="w-4 h-4 mr-2" />
            {requestHelpMutation.isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
