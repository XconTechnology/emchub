import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Building2, Home } from "lucide-react";
import { DocumentUpload } from "./DocumentUpload";

const vendorRequestSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  identificationDoc: z.string().min(1, "Identification document is required"),
  businessRegistrationDoc: z.string().min(1, "Business registration document is required"),
  addressProofDoc: z.string().min(1, "Address proof document is required"),
  description: z.string().min(10, "Please provide at least 10 characters"),
});

type VendorRequestFormData = z.infer<typeof vendorRequestSchema>;

interface BecomeVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BecomeVendorModal({ isOpen, onClose }: BecomeVendorModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [idDocUrl, setIdDocUrl] = useState<string>("");
  const [businessDocUrl, setBusinessDocUrl] = useState<string>("");
  const [addressDocUrl, setAddressDocUrl] = useState<string>("");

  const form = useForm<VendorRequestFormData>({
    resolver: zodResolver(vendorRequestSchema),
    defaultValues: {
      businessName: "",
      identificationDoc: "",
      businessRegistrationDoc: "",
      addressProofDoc: "",
      description: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: VendorRequestFormData) => {
      return apiRequest("POST", "/api/vendor-requests", data);
    },
    onSuccess: () => {
      toast({
        title: "Vendor request submitted",
        description: "Your vendor verification request has been submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      form.reset();
      setIdDocUrl("");
      setBusinessDocUrl("");
      setAddressDocUrl("");
      onClose();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error.message || "Failed to submit vendor request. Please try again.",
      });
    },
  });

  const onSubmit = (data: VendorRequestFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Become a Vendor
          </DialogTitle>
          <DialogDescription>
            Apply to become a verified vendor and start selling your products and services on EMC Hub.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name or Full Name *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Enter your business or full name"
                      data-testid="input-business-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="identificationDoc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Identification Document (ID/Passport) *
                  </FormLabel>
                  <FormControl>
                    <DocumentUpload
                      label="Upload ID Document"
                      currentUrl={idDocUrl}
                      onUploadSuccess={(url) => {
                        setIdDocUrl(url);
                        form.setValue("identificationDoc", url);
                      }}
                      onRemove={() => {
                        setIdDocUrl("");
                        form.setValue("identificationDoc", "");
                      }}
                      testId="button-upload-id"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessRegistrationDoc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Business Registration Document *
                  </FormLabel>
                  <FormControl>
                    <DocumentUpload
                      label="Upload Business Registration"
                      currentUrl={businessDocUrl}
                      onUploadSuccess={(url) => {
                        setBusinessDocUrl(url);
                        form.setValue("businessRegistrationDoc", url);
                      }}
                      onRemove={() => {
                        setBusinessDocUrl("");
                        form.setValue("businessRegistrationDoc", "");
                      }}
                      testId="button-upload-business"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="addressProofDoc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Address Proof Document *
                  </FormLabel>
                  <FormControl>
                    <DocumentUpload
                      label="Upload Address Proof"
                      currentUrl={addressDocUrl}
                      onUploadSuccess={(url) => {
                        setAddressDocUrl(url);
                        form.setValue("addressProofDoc", url);
                      }}
                      onRemove={() => {
                        setAddressDocUrl("");
                        form.setValue("addressProofDoc", "");
                      }}
                      testId="button-upload-address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Why do you want to become a vendor? *</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Tell us about your business and why you want to join our platform..."
                    rows={4}
                    data-testid="textarea-description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={mutation.isPending}
              data-testid="button-submit-vendor-request"
            >
              {mutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
