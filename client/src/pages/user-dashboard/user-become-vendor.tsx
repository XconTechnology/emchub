import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/use-websocket";
import {
  Store,
  BadgeCheck,
  Package,
  DollarSign,
  Users,
  FileText,
  Building2,
  Home,
} from "lucide-react";
import { useState, useEffect } from "react";
import { FileUpload } from "@/components/file-upload";

export default function UserBecomeVendor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscribe } = useWebSocket();

  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState<"individual" | "company">(
    "individual",
  );
  const [businessDescription, setBusinessDescription] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [identificationDoc, setIdentificationDoc] = useState("");
  const [businessRegistrationDoc, setBusinessRegistrationDoc] = useState("");
  const [addressProofDoc, setAddressProofDoc] = useState("");
  console.log(identificationDoc);
  const applyMutation = useMutation({
    mutationFn: async (data: {
      businessName: string;
      businessType: string;
      description: string;
      contactNumber: string;
      identificationDoc: string;
      businessRegistrationDoc?: string;
      addressProofDoc: string;
    }) => {
      return apiRequest("POST", "/api/vendor/apply", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      toast({
        title: "Application Submitted!",
        description:
          "Your vendor application has been submitted for review. We'll notify you once it's approved.",
      });
      // Reset form
      setBusinessName("");
      setBusinessType("individual");
      setBusinessDescription("");
      setContactNumber("");
      setIdentificationDoc("");
      setBusinessRegistrationDoc("");
      setAddressProofDoc("");
    },
    onError: () => {
      toast({
        title: "Application Failed",
        description: "Failed to submit vendor application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !businessName ||
      !contactNumber ||
      !identificationDoc ||
      !addressProofDoc
    ) {
      toast({
        title: "Missing Information",
        description:
          "Please fill in all required fields and upload all required documents",
        variant: "destructive",
      });
      return;
    }

    if (businessType === "company" && !businessRegistrationDoc) {
      toast({
        title: "Missing Document",
        description: "Business registration document is required for companies",
        variant: "destructive",
      });
      return;
    }

    applyMutation.mutate({
      businessName,
      businessType,
      description: businessDescription,
      contactNumber,
      identificationDoc,
      businessRegistrationDoc:
        businessType === "company" ? businessRegistrationDoc : undefined,
      addressProofDoc,
    });
  };

  // Listen for real-time vendor approval/rejection
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribeApproved = subscribe(
      "VENDOR_REQUEST_APPROVED",
      (message) => {
        if (message.data.userId === user.id) {
          console.log("Vendor request approved:", message.data);

          // Show success toast
          toast({
            title: "🎉 Congratulations!",
            description:
              "Your vendor application has been approved! You are now a verified vendor.",
            duration: 10000,
          });

          // Refresh user data
          queryClient.invalidateQueries({ queryKey: ["/api/me"] });
        }
      },
    );

    const unsubscribeRejected = subscribe(
      "VENDOR_REQUEST_REJECTED",
      (message) => {
        if (message.data.userId === user.id) {
          console.log("Vendor request rejected:", message.data);

          // Show rejection toast with reason
          toast({
            variant: "destructive",
            title: "Application Rejected",
            description: `Your vendor application was rejected. Reason: ${message.data.rejectionReason}`,
            duration: 10000,
          });

          // Refresh user data
          queryClient.invalidateQueries({ queryKey: ["/api/me"] });
        }
      },
    );

    return () => {
      unsubscribeApproved();
      unsubscribeRejected();
    };
  }, [user?.id, subscribe, toast]);

  // If user is already a verified vendor
  if (user?.vendorStatus === "verified") {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BadgeCheck className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            You're Already a Verified Vendor!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            You have full access to all vendor features. Start adding products,
            services, and growing your business.
          </p>
        </CardContent>
      </Card>
    );
  }

  // If user has pending application
  if (user?.vendorStatus === "pending") {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Store className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Application Under Review
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Your vendor application is currently being reviewed by our team.
            We'll notify you once it's approved.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Become a Vendor
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Apply to become a verified vendor and start selling your products and
          services
        </p>
      </div>

      {/* Benefits Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <Store className="w-8 h-8 text-blue-500 mb-2" />
            <CardTitle className="text-base">Create Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add business listings to reach more customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <Package className="w-8 h-8 text-green-500 mb-2" />
            <CardTitle className="text-base">Sell Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              List and sell your products online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <DollarSign className="w-8 h-8 text-yellow-500 mb-2" />
            <CardTitle className="text-base">Accept TimeDollars</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Accept community currency for services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <Users className="w-8 h-8 text-purple-500 mb-2" />
            <CardTitle className="text-base">Build Community</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connect with local ethnic minority community
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Application Form */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Application</CardTitle>
          <CardDescription>
            Fill out the form below and upload required documents for
            verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Type */}
            <div className="space-y-3">
              <Label>Business Type *</Label>
              <RadioGroup
                value={businessType}
                onValueChange={(value) =>
                  setBusinessType(value as "individual" | "company")
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="individual"
                    id="individual"
                    data-testid="radio-individual"
                  />
                  <Label
                    htmlFor="individual"
                    className="font-normal cursor-pointer"
                  >
                    Individual / Sole Proprietor
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="company"
                    id="company"
                    data-testid="radio-company"
                  />
                  <Label
                    htmlFor="company"
                    className="font-normal cursor-pointer"
                  >
                    Registered Company
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter your business name"
                data-testid="input-business-name"
              />
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number *</Label>
              <Input
                id="contactNumber"
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+852 1234 5678"
                data-testid="input-contact-number"
              />
            </div>

            {/* Business Description */}
            <div className="space-y-2">
              <Label htmlFor="businessDescription">
                Business Description (Optional)
              </Label>
              <Textarea
                id="businessDescription"
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                placeholder="Describe your business, products, or services"
                rows={4}
                data-testid="textarea-business-description"
              />
            </div>

            {/* Document Uploads */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Required Documents</h3>
              </div>

              <FileUpload
                label="Identification Document (ID Card / Passport)"
                accept=".pdf,.jpg,.jpeg,.png"
                onUploadComplete={setIdentificationDoc}
                value={identificationDoc}
                required
                testId="upload-identification"
              />

              {businessType === "company" && (
                <FileUpload
                  label="Business Registration Document"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onUploadComplete={setBusinessRegistrationDoc}
                  value={businessRegistrationDoc}
                  required
                  testId="upload-business-registration"
                />
              )}

              <FileUpload
                label="Address Proof (Utility Bill / Bank Statement)"
                accept=".pdf,.jpg,.jpeg,.png"
                onUploadComplete={setAddressProofDoc}
                value={addressProofDoc}
                required
                testId="upload-address-proof"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> All documents must be uploaded before
                submission. Your application will be reviewed by our staff
                within 2-3 business days.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={applyMutation.isPending}
              data-testid="button-submit-application"
            >
              {applyMutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
