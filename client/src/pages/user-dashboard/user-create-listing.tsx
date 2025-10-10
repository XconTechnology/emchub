import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertListingSchema } from "@shared/schema";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import type { Category } from "@shared/schema";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Upload, X, Store, ArrowLeft } from "lucide-react";
import { useState } from "react";
import RequestStaffHelpButton from "@/components/RequestStaffHelpButton";

export default function UserCreateListing() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const form = useForm<z.infer<typeof insertListingSchema>>({
    resolver: zodResolver(insertListingSchema),
    defaultValues: {
      type: "business",
      title: "",
      description: "",
      categoryId: "",
      phone: "",
      email: "",
      website: "",
      address: "",
      city: "",
      postalCode: "",
      latitude: "",
      longitude: "",
      isOnlineOnly: false,
      customCategory: "",
      status: "pending",
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertListingSchema>) => {
      const cleanedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value === '' ? undefined : value
        ])
      );
      return apiRequest('/api/listings', 'POST', cleanedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings/user'] });
      toast({
        title: "Listing submitted!",
        description: "Your listing has been submitted for approval.",
      });
      setLocation("/dashboard/my-listings");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create listing",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof insertListingSchema>) => {
    const finalData = {
      ...data,
      images: uploadedImages.length > 0 ? uploadedImages : undefined,
      userId: user?.id,
    };
    createListingMutation.mutate(finalData);
  };

  const handleUploadComplete = (result: any) => {
    const uploadedUrls = result.successful.map((file: any) => file.uploadURL);
    setUploadedImages([...uploadedImages, ...uploadedUrls]);
    toast({ title: "Images uploaded successfully" });
  };

  const getUploadParameters = async () => {
    const response = await apiRequest('/api/object-storage/upload-url', 'POST', {
      fileName: `listing-${Date.now()}.jpg`,
    });
    return {
      method: "PUT" as const,
      url: response.url,
    };
  };

  const handleAddImageUrl = () => {
    if (imageUrl.trim()) {
      setUploadedImages([...uploadedImages, imageUrl.trim()]);
      setImageUrl("");
      toast({ title: "Image URL added successfully" });
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard/my-listings")}
            data-testid="button-back-to-listings"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Store className="w-6 h-6" />
              Create New Business Listing
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Add your business to the EMC HUB directory
            </p>
          </div>
        </div>
        <RequestStaffHelpButton listingType="business" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Category Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Categories (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Halal Food, Pakistani Cuisine" 
                          {...field}
                          value={field.value || ""}
                          data-testid="input-custom-category"
                        />
                      </FormControl>
                      <FormDescription>
                        Separate multiple categories with commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Basic Information */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter business name" {...field} data-testid="input-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your business"
                        className="min-h-[120px]"
                        {...field}
                        data-testid="textarea-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" {...field} data-testid="input-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Email address" {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} value={field.value || ""} data-testid="input-website" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location</h3>
                <FormField
                  control={form.control}
                  name="isOnlineOnly"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-online-only"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">This is an online-only business</FormLabel>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} data-testid="input-address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Hong Kong" {...field} data-testid="input-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Postal code" {...field} value={field.value || ""} data-testid="input-postal-code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Images</h3>
                
                {/* Upload from computer */}
                <div>
                  <ObjectUploader
                    onGetUploadParameters={getUploadParameters}
                    onComplete={handleUploadComplete}
                    maxNumberOfFiles={5}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Images
                  </ObjectUploader>
                </div>

                {/* Add image by URL */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Or paste image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    data-testid="input-image-url"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddImageUrl}
                    disabled={!imageUrl.trim()}
                    data-testid="button-add-image-url"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Add URL
                  </Button>
                </div>

                {/* Preview uploaded images */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(index)}
                          data-testid={`button-remove-image-${index}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createListingMutation.isPending}
                  style={{ backgroundColor: '#8FC24C' }}
                  className="flex-1"
                  data-testid="button-submit-listing"
                >
                  {createListingMutation.isPending ? "Submitting..." : "Submit for Approval"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/dashboard/my-listings")}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
