import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Zap } from "lucide-react";

interface CreateOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceRequestId: string;
  onOfferCreated: () => void;
}

export function CreateOfferDialog({
  open,
  onOpenChange,
  serviceRequestId,
  onOfferCreated,
}: CreateOfferDialogProps) {
  const { toast } = useToast();
  const [serviceName, setServiceName] = useState("");
  const [price, setPrice] = useState("");
  const [hours, setHours] = useState("");

  const createOfferMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/service-offers", {
        serviceRequestId,
        serviceName,
        price: parseFloat(price),
        hours: parseFloat(hours),
        createdBy: "admin",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-requests", serviceRequestId, "messages"] });
      toast({ title: "Offer created and sent!" });
      setServiceName("");
      setPrice("");
      setHours("");
      onOpenChange(false);
      onOfferCreated();
    },
    onError: () => {
      toast({ title: "Failed to create offer", variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!serviceName || !price || !hours) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    createOfferMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Service Offer</DialogTitle>
          <DialogDescription>
            Create an offer for this service request
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service-name">Service Name *</Label>
            <Input
              id="service-name"
              placeholder="e.g., Web Development"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              data-testid="input-service-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (HK$) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              data-testid="input-price"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours">Hours *</Label>
            <Input
              id="hours"
              type="number"
              step="0.5"
              placeholder="e.g., 5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              data-testid="input-hours"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createOfferMutation.isPending}
            data-testid="button-create-offer"
          >
            {createOfferMutation.isPending ? "Creating..." : "Create Offer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
