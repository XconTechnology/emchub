import { useState, useEffect, useRef } from "react";
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
import { Store, MapPin, Phone, Mail, Globe, Clock, DollarSign, Tag, Calendar, Users, Package, Image, X, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Category } from "@shared/schema";

type AddListingData = z.infer<typeof insertListingSchema>;

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  editListing?: any;
}

export default function AddListingModal({ isOpen, onClose, editListing }: AddListingModalProps) {
  const { toast } = useToast();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!editListing;

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const form = useForm<AddListingData>({
    resolver: zodResolver(insertListingSchema),
    defaultValues: {
      type: "business",
      title: "",
      description: "",
      categoryId: undefined,
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

  useEffect(() => {
    if (isOpen && editListing) {
      form.reset({
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
      });
      setImageUrls(editListing.images || []);
    } else if (isOpen && !editListing) {
      form.reset({
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
      });
      setImageUrls([]);
    }
  }, [isOpen, editListing, form]);

  const addListingMutation = useMutation({
    mutationFn: async (data: AddListingData) => {
      // Transform form data for the API - hardcode type to "business"
      const transformedData = {
        ...data,
        type: "business",
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
    // Validate categoryId is not empty
    if (!data.categoryId || data.categoryId.trim() === '') {
      toast({
        title: "Category required",
        description: "Please select a category before submitting.",
        variant: "destructive",
      });
      return;
    }

    console.log('Form submitted with data:', data);
    // Include image URLs in the submission
    const submissionData = {
      ...data,
      images: imageUrls,
      type: "business",
    };
    addListingMutation.mutate(submissionData);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploadingFile(true);
    try {
      for (let i = 0; i < Math.min(files.length, 5 - imageUrls.length); i++) {
        const file = files[i];
        
        try {
          const uploadUrlResponse = await apiRequest('POST', '/api/object-storage/upload-url', {
            fileName: `listing-${Date.now()}-${i}-${file.name}`,
          });
          const uploadUrlData = await uploadUrlResponse.json();
          
          const putResponse = await fetch(uploadUrlData.url, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type,
            },
          });

          if (!putResponse.ok) {
            throw new Error('Failed to upload file');
          }

          setImageUrls(prev => {
            const newUrls = [...prev, uploadUrlData.url];
            form.setValue("images", newUrls);
            return newUrls;
          });
        } catch (error) {
          console.error('Error uploading file:', error);
          toast({
            title: "Error uploading image",
            description: `Failed to upload ${file.name}`,
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
            <p className="text-sm text-gray-600">Add images to showcase your business (up to 5 images)</p>
            
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                disabled={isUploadingFile || imageUrls.length >= 5}
                className="hidden"
                data-testid="input-file-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingFile || imageUrls.length >= 5}
                className="w-full gap-2"
                data-testid="button-upload-image"
              >
                {isUploadingFile ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Click to Upload ({imageUrls.length}/5)
                  </>
                )}
              </Button>
              
              {imageUrls.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Images ({imageUrls.length})</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Business image ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                          data-testid={`img-uploaded-${index}`}
                        />
                        <Button
                          type="button"
                          onClick={() => removeImageUrl(index)}
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                          data-testid={`button-remove-image-${index}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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