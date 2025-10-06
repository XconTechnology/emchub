import { Card, CardContent } from "@/components/ui/card";
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
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertListingSchema } from "@shared/schema";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { Category } from "@shared/schema";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { Upload, X } from "lucide-react";
import { useState } from "react";

export default function AdminAddListing() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

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
      isActive: true,
      isVerified: false,
      status: "draft",
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
      return apiRequest('POST', '/api/listings', cleanedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      toast({
        title: "Listing Created",
        description: "The new listing has been created successfully.",
      });
      setLocation('/admin/listings');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: z.infer<typeof insertListingSchema>) => {
    createListingMutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Listing</h2>
        <p className="text-muted-foreground mt-1">
          Create a new listing for your platform
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Business name" {...field} data-testid="input-title" />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your business..." 
                        {...field} 
                        rows={4}
                        data-testid="input-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+852 1234 5678" {...field} data-testid="input-phone" />
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
                        <Input type="email" placeholder="contact@business.com" {...field} data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Images (Optional)</FormLabel>
                    <div className="space-y-3">
                      <ObjectUploader
                        maxNumberOfFiles={5}
                        maxFileSize={10485760}
                        onGetUploadParameters={async () => {
                          const response = await fetch('/api/objects/upload', {
                            method: 'POST',
                            credentials: 'include',
                          });
                          if (!response.ok) throw new Error('Failed to get upload URL');
                          const { uploadURL } = await response.json();
                          return { method: 'PUT' as const, url: uploadURL };
                        }}
                        onComplete={async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
                          const urls = result.successful?.map(file => file.uploadURL) || [];
                          for (const url of urls) {
                            try {
                              const response = await fetch('/api/listing-images', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({ imageURL: url }),
                              });
                              if (response.ok) {
                                const { objectPath } = await response.json();
                                setUploadedImages(prev => [...prev, objectPath]);
                                const currentImages = field.value || [];
                                field.onChange([...currentImages, objectPath]);
                              }
                            } catch (error) {
                              console.error('Error processing upload:', error);
                            }
                          }
                          toast({
                            title: "Images Uploaded",
                            description: `${urls.length} image(s) uploaded successfully`,
                          });
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Images
                      </ObjectUploader>
                      
                      {uploadedImages.length > 0 && (
                        <div className="grid grid-cols-4 gap-3">
                          {uploadedImages.map((imagePath, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={imagePath} 
                                alt={`Upload ${index + 1}`} 
                                className="w-full h-24 object-cover rounded border"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setUploadedImages(prev => prev.filter((_, i) => i !== index));
                                  const currentImages = field.value || [];
                                  field.onChange(currentImages.filter((_, i) => i !== index));
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                data-testid={`button-remove-image-${index}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      First image will be shown in the hero section. Max 5 images, 10MB each.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isOnlineOnly"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-online-only"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Online Only
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Check if this is an online-only business (no physical location)
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {!form.watch("isOnlineOnly") && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Street address" {...field} data-testid="input-address" />
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
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="999077" {...field} value={field.value || ""} data-testid="input-postal" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input placeholder="22.3193" {...field} value={field.value || ""} data-testid="input-latitude" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input placeholder="114.1694" {...field} value={field.value || ""} data-testid="input-longitude" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publish Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft (not visible to public)</SelectItem>
                        <SelectItem value="published">Published (visible to public)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Draft listings are only visible in the admin dashboard
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setLocation('/admin/listings')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createListingMutation.isPending}
                  data-testid="button-submit-listing"
                >
                  {createListingMutation.isPending ? 'Creating...' : 'Create Listing'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
