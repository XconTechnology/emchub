import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertListingSchema } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useState } from "react";
import { Upload, X, DollarSign, Coins, Receipt } from "lucide-react";
import RequestStaffHelpButton from "./RequestStaffHelpButton";

const listingSchema = insertListingSchema.extend({
  title: z.string().min(1, "Business name is required"),
  description: z.string().optional(),
  customCategory: z.string().optional(),
  status: z.enum(["draft", "published", "pending", "rejected"]),
});

type ListingFormData = z.infer<typeof listingSchema>;

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  editListing?: any;
}

export default function AddListingModal({ isOpen, onClose, editListing }: AddListingModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isEditing = !!editListing;
  const [imageUrl, setImageUrl] = useState<string>(editListing?.images?.[0] || "");
  const [paymentType, setPaymentType] = useState(editListing?.paymentType || "cash_only");
  const [cashPercentage, setCashPercentage] = useState(editListing?.cashPercentage || 50);

  const form = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: editListing ? {
      type: "business",
      title: editListing.title || "",
      description: editListing.description || "",
      customCategory: editListing.customCategory || "",
      phone: editListing.phone || "",
      email: editListing.email || "",
      website: editListing.website || "",
      address: editListing.address || "",
      city: editListing.city || "",
      postalCode: editListing.postalCode || "",
      isOnlineOnly: editListing.isOnlineOnly || false,
      price: editListing.price?.toString() || "",
      status: editListing.status || "pending",
    } : {
      type: "business",
      title: "",
      description: "",
      customCategory: "",
      phone: "",
      email: "",
      website: "",
      address: "",
      city: "",
      postalCode: "",
      isOnlineOnly: false,
      price: "",
      status: "pending",
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const uploadRes = await apiRequest("/api/objects/upload", "POST");
      const { uploadURL } = await uploadRes.json();
      
      await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      const imageRes = await apiRequest("/api/listing-images", "PUT", {
        imageURL: uploadURL.split("?")[0],
      });
      const { publicURL } = await imageRes.json();
      return publicURL;
    },
    onSuccess: (url) => {
      setImageUrl(url);
      toast({ title: "Image uploaded successfully" });
    },
    onError: () => {
      toast({ title: "Failed to upload image", variant: "destructive" });
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: ListingFormData) => {
      const listingData = {
        ...data,
        type: "business",
        userId: user?.id,
        images: imageUrl ? [imageUrl] : [],
        paymentType,
        cashPercentage: paymentType === 'combo' ? cashPercentage : null,
        timedollarPercentage: paymentType === 'combo' ? (100 - cashPercentage) : null,
        status: isEditing ? editListing.status : "pending",
      };
      const res = await apiRequest(
        isEditing ? `/api/listings/${editListing.id}` : "/api/listings",
        isEditing ? "PUT" : "POST",
        listingData
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings/user'] });
      toast({ 
        title: isEditing ? "Listing updated successfully!" : "Listing added successfully!",
        description: isEditing ? "Your changes have been saved and will be reviewed." : "Your listing has been submitted for review.",
      });
      form.reset();
      setImageUrl("");
      onClose();
    },
    onError: (error: Error) => {
      toast({ 
        title: isEditing ? "Failed to update listing" : "Failed to add listing", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImageMutation.mutate(file);
    }
  };

  const handleCashPercentageChange = (value: number) => {
    if (value >= 0 && value <= 100) {
      setCashPercentage(value);
    }
  };

  const onSubmit = (data: ListingFormData) => {
    createListingMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{isEditing ? "Edit Listing" : "Add New Listing"}</DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? "Update your business listing details below." 
                  : "Add your business to the EMC HUB directory"
                }
              </DialogDescription>
            </div>
            <RequestStaffHelpButton listingType="business" variant="ghost" size="sm" />
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Business Name *</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="e.g., Halal Restaurant & Grocery"
              data-testid="input-listing-title"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customCategory">Category</Label>
            <Input
              id="customCategory"
              {...form.register("customCategory")}
              placeholder="e.g., Restaurant, Halal Food, Pakistani Cuisine"
              data-testid="input-customCategory"
            />
            <p className="text-xs text-muted-foreground">
              Enter categories separated by commas
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Describe your business..."
              rows={3}
              data-testid="textarea-description"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                placeholder="Phone number"
                data-testid="input-phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="Email address"
                data-testid="input-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...form.register("website")}
                placeholder="https://example.com"
                data-testid="input-website"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Location</Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isOnlineOnly"
                checked={form.watch("isOnlineOnly") || false}
                onCheckedChange={(checked) => form.setValue("isOnlineOnly", !!checked)}
                data-testid="checkbox-online-only"
              />
              <Label htmlFor="isOnlineOnly" className="text-sm font-normal">
                This is an online-only business
              </Label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  {...form.register("address")}
                  placeholder="123 Main St"
                  data-testid="input-address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...form.register("city")}
                  placeholder="Hong Kong"
                  data-testid="input-city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  {...form.register("postalCode")}
                  placeholder="Postal code"
                  data-testid="input-postal-code"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price Range (Optional)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...form.register("price")}
                  placeholder="Average price"
                  data-testid="input-price"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Payment Options</Label>
            <RadioGroup value={paymentType} onValueChange={setPaymentType}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="cash_only" id="cash_only" />
                <Label htmlFor="cash_only" className="flex-1 cursor-pointer flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span>Cash Only</span>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="timedollar_only" id="timedollar_only" />
                <Label htmlFor="timedollar_only" className="flex-1 cursor-pointer flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-600" />
                  <span>TimeDollar Only</span>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="both_choice" id="both_choice" />
                <Label htmlFor="both_choice" className="flex-1 cursor-pointer flex items-center gap-2">
                  <div className="flex gap-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <Coins className="w-4 h-4 text-yellow-600" />
                  </div>
                  <span>Both (Customer Choice)</span>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="combo" id="combo" />
                <Label htmlFor="combo" className="flex-1 cursor-pointer flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-blue-600" />
                  <span>Cash + TimeDollar Combo</span>
                </Label>
              </div>
            </RadioGroup>

            {paymentType === 'combo' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                <Label className="text-sm font-semibold">Payment Split Configuration</Label>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cash-percentage" className="text-sm">Cash: {cashPercentage}%</Label>
                    <Input
                      id="cash-percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={cashPercentage}
                      onChange={(e) => handleCashPercentageChange(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="td-percentage" className="text-sm">TimeDollar: {100 - cashPercentage}%</Label>
                    <Input
                      id="td-percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={100 - cashPercentage}
                      onChange={(e) => handleCashPercentageChange(100 - (parseInt(e.target.value) || 0))}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Business Image</Label>
            {imageUrl ? (
              <div className="relative">
                <img src={imageUrl} alt="Business" className="w-full h-48 object-cover rounded-lg" />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setImageUrl("")}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <Label htmlFor="image-upload" className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">
                  Click to upload image
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploadImageMutation.isPending}
                  data-testid="input-image"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createListingMutation.isPending}
              data-testid="button-submit"
            >
              {createListingMutation.isPending 
                ? (isEditing ? "Updating..." : "Submitting...") 
                : (isEditing ? "Update Listing" : "Submit for Review")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
