import { useState, useEffect } from "react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Store, MapPin, Phone, Mail, Globe, Clock, DollarSign, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { BusinessListing } from "@shared/schema";

const editListingSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().optional(),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  cuisineType: z.string().optional(),
  priceRange: z.string().min(1, "Price range is required"),
  tags: z.string().optional(),
  imageUrl: z.string().url("Please enter a valid image URL").optional().or(z.literal("")),
});

type EditListingData = z.infer<typeof editListingSchema>;

interface EditListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: BusinessListing | null;
}

const categories = [
  "Restaurant",
  "Food & Beverage",
  "Retail Store",
  "Grocery Store",
  "Market",
  "Bakery",
  "Catering",
  "Food Truck",
  "Import/Export",
  "Services",
  "Other"
];

const priceRanges = [
  { value: "$", label: "$ - Budget Friendly" },
  { value: "$$", label: "$$ - Moderate" },
  { value: "$$$", label: "$$$ - Expensive" },
  { value: "$$$$", label: "$$$$ - Very Expensive" },
];

export default function EditListingModal({ isOpen, onClose, listing }: EditListingModalProps) {
  const { toast } = useToast();

  const form = useForm<EditListingData>({
    resolver: zodResolver(editListingSchema),
    defaultValues: {
      businessName: "",
      category: "",
      description: "",
      address: "",
      city: "",
      postalCode: "",
      phone: "",
      email: "",
      website: "",
      cuisineType: "",
      priceRange: "",
      tags: "",
      imageUrl: "",
    },
  });

  // Update form with listing data when listing changes
  useEffect(() => {
    if (listing) {
      form.reset({
        businessName: listing.businessName || "",
        category: listing.category || "",
        description: listing.description || "",
        address: listing.address || "",
        city: listing.city || "",
        postalCode: listing.postalCode || "",
        phone: listing.phone || "",
        email: listing.email || "",
        website: listing.website || "",
        cuisineType: listing.cuisineType || "",
        priceRange: listing.priceRange || "",
        tags: Array.isArray(listing.tags) ? listing.tags.join(", ") : "",
        imageUrl: listing.imageUrl || "",
      });
    }
  }, [listing, form]);

  const updateListingMutation = useMutation({
    mutationFn: async (data: EditListingData) => {
      if (!listing) throw new Error("No listing to update");
      return apiRequest("PUT", `/api/listings/${listing.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings/user'] });
      toast({
        title: "Success!",
        description: "Business listing updated successfully.",
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      console.error("Error updating listing:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update business listing. Please try again.",
      });
    },
  });

  const onSubmit = (data: EditListingData) => {
    updateListingMutation.mutate(data);
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  if (!listing) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            Edit Business Listing
          </DialogTitle>
          <DialogDescription>
            Update your business information to keep your listing current and accurate.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Business Name & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName" className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                Business Name *
              </Label>
              <Input
                id="businessName"
                {...form.register("businessName")}
                placeholder="Enter your business name"
                data-testid="input-business-name"
              />
              {form.formState.errors.businessName && (
                <p className="text-sm text-red-500">{form.formState.errors.businessName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value)}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Describe your business, what you offer, and what makes you special..."
              className="min-h-[100px]"
              data-testid="textarea-description"
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location Information
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                {...form.register("address")}
                placeholder="Street address"
                data-testid="input-address"
              />
              {form.formState.errors.address && (
                <p className="text-sm text-red-500">{form.formState.errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  {...form.register("city")}
                  placeholder="City"
                  data-testid="input-city"
                />
                {form.formState.errors.city && (
                  <p className="text-sm text-red-500">{form.formState.errors.city.message}</p>
                )}
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
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone *
                </Label>
                <Input
                  id="phone"
                  {...form.register("phone")}
                  placeholder="+852 1234 5678"
                  data-testid="input-phone"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="business@example.com"
                  data-testid="input-email"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website
              </Label>
              <Input
                id="website"
                {...form.register("website")}
                placeholder="https://www.yourbusiness.com"
                data-testid="input-website"
              />
              {form.formState.errors.website && (
                <p className="text-sm text-red-500">{form.formState.errors.website.message}</p>
              )}
            </div>
          </div>

          {/* Business Details */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Business Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cuisineType">Cuisine Type</Label>
                <Input
                  id="cuisineType"
                  {...form.register("cuisineType")}
                  placeholder="e.g., Pakistani, Indian, Middle Eastern"
                  data-testid="input-cuisine-type"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceRange">Price Range *</Label>
                <Select value={form.watch("priceRange")} onValueChange={(value) => form.setValue("priceRange", value)}>
                  <SelectTrigger data-testid="select-price-range">
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.priceRange && (
                  <p className="text-sm text-red-500">{form.formState.errors.priceRange.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </Label>
              <Input
                id="tags"
                {...form.register("tags")}
                placeholder="halal, vegetarian, delivery, takeaway (comma separated)"
                data-testid="input-tags"
              />
              <p className="text-sm text-gray-500">Separate tags with commas to help customers find you</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Business Image URL</Label>
              <Input
                id="imageUrl"
                {...form.register("imageUrl")}
                placeholder="https://example.com/image.jpg"
                data-testid="input-image-url"
              />
              {form.formState.errors.imageUrl && (
                <p className="text-sm text-red-500">{form.formState.errors.imageUrl.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateListingMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary/90"
              data-testid="button-update-listing"
            >
              {updateListingMutation.isPending ? "Updating..." : "Update Listing"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}