import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { insertListingSchema } from "@shared/schema";
import { z } from "zod";
import { Store, MapPin, Phone, Mail, Globe, Clock, DollarSign, Tag, Calendar, Users, Package, Image, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Category } from "@shared/schema";

type AddListingData = z.infer<typeof insertListingSchema>;

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  editListing?: any;
}

export default function AddListingModal({ isOpen, onClose, editListing }: AddListingModalProps) {
  const { toast } = useToast();
  const [imageUrls, setImageUrls] = useState<string[]>(editListing?.images || []);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const isEditing = !!editListing;

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const form = useForm<AddListingData>({
    resolver: zodResolver(insertListingSchema),
    defaultValues: editListing ? {
      type: "listing",
      title: editListing.title || "",
      description: editListing.description || "",
      categoryId: editListing.categoryId || "",
      address: editListing.address || "",
      city: editListing.city || "",
      postalCode: editListing.postalCode || "",
      isOnlineOnly: editListing.isOnlineOnly || false,
      phone: editListing.phone || "",
      email: editListing.email || "",
      website: editListing.website || "",
      images: editListing.images || [],
      tags: editListing.tags || [],
      price: editListing.price,
      inventory: editListing.inventory,
      duration: editListing.duration,
      eventDate: editListing.eventDate,
      eventEndDate: editListing.eventEndDate,
      capacity: editListing.capacity,
      eventPrice: editListing.eventPrice,
    } : {
      type: "listing",
      title: "",
      description: "",
      categoryId: "",
      address: "",
      city: "",
      postalCode: "",
      isOnlineOnly: false,
      phone: "",
      email: "",
      website: "",
      images: [],
      tags: [],
      price: undefined,
      inventory: undefined,
      duration: undefined,
      eventDate: undefined,
      eventEndDate: undefined,
      capacity: undefined,
      eventPrice: undefined,
    },
  });

  const addListingMutation = useMutation({
    mutationFn: async (data: AddListingData) => {
      // Transform form data for the API - hardcode type to "listing"
      const transformedData = {
        ...data,
        type: "listing",
        status: isEditing ? editListing.status : "pending",
      };

      console.log('Sending to API:', transformedData);

      const response = await fetch(isEditing ? `/api/listings/${editListing.id}` : "/api/listings", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transformedData),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('API Error:', error);
        throw new Error(error.message || "Failed to add listing");
      }
      
      const result = await response.json();
      console.log('API Success:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/listings/user"] });
      toast({
        title: isEditing ? "Listing updated successfully!" : "Listing added successfully!",
        description: isEditing ? "Your changes have been saved and will be reviewed." : "Your listing has been submitted for review.",
      });
      onClose();
      form.reset();
      setImageUrls([]);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add listing",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    console.log('Form submitted with data:', data);
    // Include image URLs in the submission
    const submissionData = {
      ...data,
      images: imageUrls,
      type: "listing",
    };
    addListingMutation.mutate(submissionData);
  };

  const addImageUrl = () => {
    if (currentImageUrl.trim() && !imageUrls.includes(currentImageUrl.trim())) {
      const newUrls = [...imageUrls, currentImageUrl.trim()];
      setImageUrls(newUrls);
      form.setValue("images", newUrls);
      setCurrentImageUrl("");
    }
  };

  const removeImageUrl = (indexToRemove: number) => {
    const newUrls = imageUrls.filter((_, index) => index !== indexToRemove);
    setImageUrls(newUrls);
    form.setValue("images", newUrls);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            {isEditing ? "Edit Listing" : "Add New Listing"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update your listing details below."
              : "Add your business to our directory to connect with the Hong Kong ethnic minority community."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <div className="relative">
                <Store className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="title"
                  placeholder="Enter your business name"
                  className="pl-10"
                  data-testid="input-title"
                  {...form.register("title")}
                />
              </div>
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">Category *</Label>
              <Select value={form.watch("categoryId") || ""} onValueChange={(value) => form.setValue("categoryId", value)}>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.categoryId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.categoryId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
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
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isOnlineOnly"
                  checked={form.watch("isOnlineOnly") || false}
                  onCheckedChange={(checked) => form.setValue("isOnlineOnly", !!checked)}
                  data-testid="checkbox-online-only"
                />
                <Label htmlFor="isOnlineOnly">This is an online/remote service</Label>
              </div>
            </div>

            {!form.watch("isOnlineOnly") && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
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
                    <Label htmlFor="city">City</Label>
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
              </>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
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
                    placeholder="contact@example.com"
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
                    placeholder="https://example.com"
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

          {/* Images Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Images</h3>
            <p className="text-sm text-gray-600">Add images to showcase your business. Enter image URLs below.</p>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Image className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                    className="pl-10"
                    value={currentImageUrl}
                    onChange={(e) => setCurrentImageUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                    data-testid="input-image-url"
                  />
                </div>
                <Button
                  type="button"
                  onClick={addImageUrl}
                  disabled={!currentImageUrl.trim()}
                  variant="outline"
                  size="icon"
                  data-testid="button-add-image"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {imageUrls.length > 0 && (
                <div className="space-y-2">
                  <Label>Added Images ({imageUrls.length})</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                        <img
                          src={url}
                          alt={`Business image ${index + 1}`}
                          className="w-12 h-12 object-cover rounded border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' fill='%23ddd'%3E%3Crect width='48' height='48' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='12' fill='%23999'%3E?%3C/text%3E%3C/svg%3E";
                          }}
                        />
                        <span className="flex-1 text-sm truncate" title={url}>
                          {url}
                        </span>
                        <Button
                          type="button"
                          onClick={() => removeImageUrl(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          data-testid={`button-remove-image-${index}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                Tip: Use image hosting services like Imgur, Google Drive (public links), or your own website
              </p>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Details</h3>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="tags"
                  placeholder="halal, family-friendly, delivery (comma separated)"
                  className="pl-10"
                  data-testid="input-tags"
                  {...form.register("tags")}
                />
              </div>
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