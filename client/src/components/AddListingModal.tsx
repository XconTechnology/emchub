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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Store, MapPin, Phone, Mail, Globe, Clock, DollarSign, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

const addListingSchema = z.object({
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

type AddListingData = z.infer<typeof addListingSchema>;

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export default function AddListingModal({ isOpen, onClose }: AddListingModalProps) {
  const { toast } = useToast();

  const form = useForm<AddListingData>({
    resolver: zodResolver(addListingSchema),
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

  const addListingMutation = useMutation({
    mutationFn: async (data: AddListingData) => {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add listing");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({
        title: "Listing added successfully!",
        description: "Your business listing has been submitted for review.",
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add listing",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddListingData) => {
    addListingMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Add Your Business Listing
          </DialogTitle>
          <DialogDescription>
            Add your halal business to our directory to connect with the Hong Kong ethnic minority community.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <div className="relative">
                <Store className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="businessName"
                  placeholder="Enter your business name"
                  className="pl-10"
                  data-testid="input-business-name"
                  {...form.register("businessName")}
                />
              </div>
              {form.formState.errors.businessName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.businessName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value)}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select a category" />
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
                <p className="text-sm text-destructive">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your business, what makes it special, and what you offer..."
                className="min-h-[100px]"
                data-testid="textarea-description"
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Location</h3>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  placeholder="Street address"
                  className="pl-10"
                  data-testid="input-address"
                  {...form.register("address")}
                />
              </div>
              {form.formState.errors.address && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="Hong Kong"
                  data-testid="input-city"
                  {...form.register("city")}
                />
                {form.formState.errors.city && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.city.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  placeholder="Optional"
                  data-testid="input-postal-code"
                  {...form.register("postalCode")}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="+852 XXXX XXXX"
                  className="pl-10"
                  data-testid="input-phone"
                  {...form.register("phone")}
                />
              </div>
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="business@example.com"
                    className="pl-10"
                    data-testid="input-email"
                    {...form.register("email")}
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    placeholder="https://yourbusiness.com"
                    className="pl-10"
                    data-testid="input-website"
                    {...form.register("website")}
                  />
                </div>
                {form.formState.errors.website && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.website.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cuisineType">Cuisine Type</Label>
                <Input
                  id="cuisineType"
                  placeholder="e.g. Pakistani, Indian, Middle Eastern"
                  data-testid="input-cuisine-type"
                  {...form.register("cuisineType")}
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
                  <p className="text-sm text-destructive">
                    {form.formState.errors.priceRange.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="tags"
                  placeholder="halal, family-friendly, takeaway, delivery (comma separated)"
                  className="pl-10"
                  data-testid="input-tags"
                  {...form.register("tags")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Business Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
                data-testid="input-image-url"
                {...form.register("imageUrl")}
              />
              {form.formState.errors.imageUrl && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.imageUrl.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={addListingMutation.isPending}
              data-testid="button-submit"
            >
              {addListingMutation.isPending ? "Adding..." : "Add Listing"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}