import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Store, BadgeCheck, Package, DollarSign, Users } from "lucide-react";
import { useState } from "react";

export default function UserBecomeVendor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  const applyMutation = useMutation({
    mutationFn: async (data: { businessName: string; businessDescription: string; contactNumber: string }) => {
      return apiRequest('POST', '/api/vendor/apply', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
      toast({
        title: "Application Submitted!",
        description: "Your vendor application has been submitted for review. We'll notify you once it's approved.",
      });
      setBusinessName("");
      setBusinessDescription("");
      setContactNumber("");
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
    if (!businessName || !businessDescription || !contactNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    applyMutation.mutate({ businessName, businessDescription, contactNumber });
  };

  // If user is already a verified vendor
  if (user?.vendorStatus === 'verified') {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BadgeCheck className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            You're Already a Verified Vendor!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            You have full access to all vendor features. Start adding products, services, and growing your business.
          </p>
        </CardContent>
      </Card>
    );
  }

  // If user has pending application
  if (user?.vendorStatus === 'pending') {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Store className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Application Under Review
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Your vendor application is currently being reviewed by our team. We'll notify you once it's approved.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Become a Vendor</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Apply to become a verified vendor and start selling your products and services
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
            Fill out the form below to apply for vendor verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="businessDescription">Business Description *</Label>
              <Textarea
                id="businessDescription"
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                placeholder="Describe your business, products, or services"
                rows={4}
                data-testid="textarea-business-description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number *</Label>
              <Input
                id="contactNumber"
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Enter your contact number"
                data-testid="input-contact-number"
              />
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
