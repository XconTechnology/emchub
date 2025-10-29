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
import { LifeBuoy, Upload, X } from "lucide-react";

interface ContactSupportFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactSupportForm({ isOpen, onClose }: ContactSupportFormProps) {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [issueType, setIssueType] = useState("general");
  const [priority, setPriority] = useState("normal");
  const [attachment, setAttachment] = useState<File | null>(null);

  const createTicketMutation = useMutation({
    mutationFn: async (data: { 
      subject: string; 
      message: string; 
      issueType: string;
      priority: string;
      attachmentUrl?: string;
    }) => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setAttachment(file);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Validation Error",
        description: "Subject and message are required.",
        variant: "destructive",
      });
      return;
    }

    let attachmentUrl: string | undefined;

    // Upload attachment if present
    if (attachment) {
      try {
        const formData = new FormData();
        formData.append('file', attachment);
        
        const uploadResponse = await fetch('/api/upload-support-attachment', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload attachment');
        }

        const uploadData = await uploadResponse.json();
        attachmentUrl = uploadData.url;
      } catch (error) {
        toast({
          title: "Upload Error",
          description: "Failed to upload attachment. Submitting ticket without attachment.",
          variant: "destructive",
        });
      }
    }

    createTicketMutation.mutate({
      subject: subject.trim(),
      message: message.trim(),
      issueType,
      priority,
      attachmentUrl,
    });
  };

  const handleClose = () => {
    setSubject("");
    setMessage("");
    setIssueType("general");
    setPriority("normal");
    setAttachment(null);
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
            <Label htmlFor="issueType">Issue Type / Category *</Label>
            <Select value={issueType} onValueChange={setIssueType}>
              <SelectTrigger id="issueType" data-testid="select-issue-type">
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general" data-testid="option-issue-general">General Inquiry</SelectItem>
                <SelectItem value="support" data-testid="option-issue-support">Support</SelectItem>
                <SelectItem value="sales" data-testid="option-issue-sales">Sales</SelectItem>
                <SelectItem value="listing" data-testid="option-issue-listing">Listing</SelectItem>
                <SelectItem value="mediator" data-testid="option-issue-mediator">Mediator</SelectItem>
                <SelectItem value="other" data-testid="option-issue-other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message / Description *</Label>
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
            <Label htmlFor="attachment">Attachment (Optional)</Label>
            <div className="space-y-2">
              {!attachment ? (
                <div className="flex items-center gap-2">
                  <Input
                    id="attachment"
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                    data-testid="input-attachment"
                  />
                  <Upload className="w-4 h-4 text-muted-foreground" />
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/50">
                  <div className="flex-1 text-sm truncate" data-testid="text-attachment-name">
                    {attachment.name} ({(attachment.size / 1024).toFixed(1)} KB)
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveAttachment}
                    data-testid="button-remove-attachment"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Accepted formats: Images, PDF, Word documents (Max 10MB)
              </p>
            </div>
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
