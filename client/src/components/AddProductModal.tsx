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
import { useState } from "react";
import { Upload, X } from "lucide-react";

const productSchema = insertListingSchema.extend({
  title: z.string().min(1, "Product name is required"),
  price: z.string().min(1, "Price is required"),
  inventory: z.string().min(1, "Stock quantity is required"),
  status: z.enum(["draft", "published", "pending", "rejected"]),
});

type ProductFormData = z.infer<typeof productSchema>;

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState<string>("");

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      type: "product",
      title: "",
      description: "",
      categoryId: "",
      price: "",
      inventory: "",
      status: "pending",
    },
  });

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

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const productData = {
        ...data,
        type: "product",
        userId: user?.id,
        price: parseFloat(data.price),
        inventory: parseInt(data.inventory),
        images: imageUrl ? [imageUrl] : [],
      };
      const res = await apiRequest("POST", "/api/listings", productData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings/user'] });
      toast({ title: "Product added successfully!" });
      form.reset();
      setImageUrl("");
      onClose();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add product", description: error.message, variant: "destructive" });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImageMutation.mutate(file);
    }
  };

  const onSubmit = (data: ProductFormData) => {
    createProductMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>Add a product to your marketplace</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Product Name *</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="e.g., Organic Honey"
              data-testid="input-product-name"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Category *</Label>
            <Select onValueChange={(value) => form.setValue("categoryId", value)}>
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
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...form.register("price")}
                placeholder="0.00"
                data-testid="input-price"
              />
              {form.formState.errors.price && (
                <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="inventory">Stock Quantity *</Label>
              <Input
                id="inventory"
                type="number"
                {...form.register("inventory")}
                placeholder="0"
                data-testid="input-stock"
              />
              {form.formState.errors.inventory && (
                <p className="text-sm text-red-500">{form.formState.errors.inventory.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Describe your product..."
              rows={4}
              data-testid="textarea-description"
            />
          </div>

          <div className="space-y-2">
            <Label>Product Image</Label>
            {imageUrl ? (
              <div className="relative">
                <img src={imageUrl} alt="Product" className="w-full h-48 object-cover rounded-lg" />
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

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select onValueChange={(value) => form.setValue("status", value as "draft" | "published")} defaultValue="draft">
              <SelectTrigger data-testid="select-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Publish</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createProductMutation.isPending}
              data-testid="button-submit"
            >
              {createProductMutation.isPending ? "Adding..." : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
