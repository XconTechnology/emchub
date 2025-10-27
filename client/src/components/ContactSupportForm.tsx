import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { LifeBuoy } from "lucide-react";

interface ContactSupportFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactSupportForm({ isOpen, onClose }: ContactSupportFormProps) {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");

  const createTicketMutation = useMutation({
    mutationFn: async (data: { subject: string; message: string; priority: string }) => {
      const response = await apiRequest("POST", "/api/support-tickets", data);
      return response.json();
    },
    onSuccess: () => {
      console.log("New support ticket created");
      toast({
        title: "Support Ticket Submitted",
        description: "We've received your request and will get back to you soon.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets/my-tickets'] });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit support ticket. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Validation Error",
        description: "Subject and message are required.",
        variant: "destructive",
      });
      return;
    }

    createTicketMutation.mutate({
      subject: subject.trim(),
      message: message.trim(),
      priority,
    });
  };

  const handleClose = () => {
    setSubject("");
    setMessage("");
    setPriority("normal");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]" data-testid="dialog-contact-support">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-primary" />
            <DialogTitle data-testid="title-contact-support">Contact Support</DialogTitle>
          </div>
          <DialogDescription>
            Need help? Submit a support ticket and our team will assist you as soon as possible.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of your issue"
              required
              data-testid="input-subject"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please provide details about your issue or question..."
              rows={6}
              required
              data-testid="textarea-message"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="priority" data-testid="select-priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low" data-testid="option-priority-low">Low</SelectItem>
                <SelectItem value="normal" data-testid="option-priority-normal">Normal</SelectItem>
                <SelectItem value="high" data-testid="option-priority-high">High</SelectItem>
                <SelectItem value="urgent" data-testid="option-priority-urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createTicketMutation.isPending}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTicketMutation.isPending}
              data-testid="button-submit"
            >
              {createTicketMutation.isPending ? "Submitting..." : "Submit Ticket"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
