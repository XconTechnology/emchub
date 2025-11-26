import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertListingSchema } from "@shared/schema";
import type { Category } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Upload, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const serviceSchema = insertListingSchema.extend({
  title: z.string().min(1, "Service title is required"),
  categoryId: z.string().min(1, "Category is required"),
  price: z.string().optional(),
  isActive: z.boolean(),
  status: z.enum(["draft", "published", "pending", "rejected"]),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editService?: any;
}

export default function AddServiceModal({ isOpen, onClose, editService }: AddServiceModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isEditing = !!editService;
  const [imageUrl, setImageUrl] = useState<string>("");
  const [useTimeDollars, setUseTimeDollars] = useState(false);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      type: "service",
      title: "",
      description: "",
      categoryId: "",
      price: "",
      isActive: true,
      status: "pending",
    },
  });

  useEffect(() => {
    if (isOpen && editService) {
      form.reset({
        type: "service",
        title: editService.title || "",
        description: editService.description || "",
        categoryId: editService.categoryId || "",
        price: editService.price?.toString() || "",
        isActive: editService.isActive ?? true,
        status: editService.status || "pending",
      });
      setImageUrl(editService.images?.[0] || "");
      setUseTimeDollars(editService.paymentMethods?.includes('td') || false);
    } else if (isOpen && !editService) {
      form.reset({
        type: "service",
        title: "",
        description: "",
        categoryId: "",
        price: "",
        isActive: true,
        status: "pending",
      });
      setImageUrl("");
      setUseTimeDollars(false);
    }
  }, [isOpen, editService, form]);

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const uploadRes = await apiRequest("POST", "/api/objects/upload");
      const { uploadURL } = await uploadRes.json();
      
      await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      const imageRes = await apiRequest("PUT", "/api/listing-images", {
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

  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const serviceData = {
        ...data,
        type: "service",
        userId: user?.id,
        price: data.price ? parseFloat(data.price) : undefined,
        paymentMethods: useTimeDollars ? ['td'] : data.price ? ['cash'] : [],
        images: imageUrl ? [imageUrl] : [],
        status: isEditing ? editService.status : "pending",
      };
      const res = await apiRequest(
        isEditing ? "PUT" : "POST",
        isEditing ? `/api/listings/${editService.id}` : "/api/listings",
        serviceData
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings/user'] });
      toast({ 
        title: isEditing ? "Service updated successfully!" : "Service added successfully!",
        description: isEditing ? "Your changes have been saved and will be reviewed." : "Your service has been submitted for review.",
      });
      form.reset();
      setImageUrl("");
      setUseTimeDollars(false);
      onClose();
    },
    onError: (error: Error) => {
      toast({ 
        title: isEditing ? "Failed to update service" : "Failed to add service", 
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

  const onSubmit = (data: ServiceFormData) => {
    createServiceMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Service" : "Add New Service"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update your service details below." 
              : "Add a service to your marketplace"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Service Title *</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="e.g., Home Cleaning Service"
              data-testid="input-service-title"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Category *</Label>
            <Select 
              value={form.watch("categoryId") || ""} 
              onValueChange={(value) => {
                form.setValue("categoryId", value, { shouldValidate: true });
              }}
            >
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.categoryId && (
              <p className="text-sm text-red-500">{form.formState.errors.categoryId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Describe your service..."
              rows={4}
              data-testid="textarea-description"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="use-timedollars"
              checked={useTimeDollars}
              onCheckedChange={setUseTimeDollars}
              data-testid="switch-timedollars"
            />
            <Label htmlFor="use-timedollars" className="cursor-pointer">
              Accept TimeDollars for this service
            </Label>
          </div>

          {!useTimeDollars && (
            <div className="space-y-2">
              <Label htmlFor="price">Price (Optional)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...form.register("price")}
                placeholder="0.00"
                data-testid="input-price"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Service Image</Label>
            {imageUrl ? (
              <div className="relative">
                <img src={imageUrl} alt="Service" className="w-full h-48 object-cover rounded-lg" />
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

          <div className="flex items-center space-x-2">
            <Switch
              id="is-active"
              checked={form.watch("isActive")}
              onCheckedChange={(checked) => form.setValue("isActive", checked)}
              data-testid="switch-active"
            />
            <Label htmlFor="is-active" className="cursor-pointer">
              Service is Active
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select 
              value={form.watch("status") || "draft"} 
              onValueChange={(value) => form.setValue("status", value as "draft" | "published" | "pending" | "rejected", { shouldValidate: true })}
            >
              <SelectTrigger data-testid="select-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Submit for Review</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.status && (
              <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createServiceMutation.isPending}
              data-testid="button-submit"
            >
              {createServiceMutation.isPending 
                ? (isEditing ? "Updating..." : "Adding...") 
                : (isEditing ? "Update Service" : "Add Service")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
