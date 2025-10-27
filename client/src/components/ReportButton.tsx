import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Flag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertReportSchema } from "@shared/schema";

const formSchema = insertReportSchema.extend({
  reportedItemId: z.string().min(1, "Item ID is required"),
  reportedItemType: z.enum(["product", "vendor"]),
  reason: z.enum(["fraud", "spam", "inappropriate", "other"]),
  details: z.string().max(500, "Details must be less than 500 characters").optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ReportButtonProps {
  reportedItemId: string;
  reportedItemType: "product" | "vendor";
  variant?: "default" | "ghost" | "outline" | "icon";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export default function ReportButton({
  reportedItemId,
  reportedItemType,
  variant = "ghost",
  size = "sm",
  className = "",
}: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reportedItemId,
      reportedItemType,
      reason: "spam",
      details: "",
    },
  });

  const selectedReason = form.watch("reason");

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest('POST', '/api/reports', data);
    },
    onSuccess: () => {
      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our platform safe.",
      });
      form.reset();
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit report",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    submitMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          data-testid="button-report"
        >
          <Flag className="w-4 h-4 mr-1" />
          Report
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-report">
        <DialogHeader>
          <DialogTitle>Report {reportedItemType === "product" ? "Product" : "Vendor"}</DialogTitle>
          <DialogDescription>
            Help us maintain a safe marketplace by reporting inappropriate content.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Report</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-reason">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fraud">Fraud or Scam</SelectItem>
                      <SelectItem value="spam">Spam</SelectItem>
                      <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedReason === "other" && (
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please provide more details about your report..."
                        rows={4}
                        {...field}
                        data-testid="textarea-details"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={submitMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitMutation.isPending}
                data-testid="button-submit-report"
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Report"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
