import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertListingSchema } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Upload, X, Tag } from "lucide-react";

const couponSchema = z.object({
  code: z.string().min(3, "Coupon code must be at least 3 characters"),
  title: z.string().min(1, "Coupon title is required"),
  description: z.string().optional(),
  discountType: z.enum(["cash", "timedollar", "both"]),
  cashDiscountType: z.enum(["percentage", "fixed"]).optional(),
  cashDiscountValue: z.string().optional(),
  tdDiscountType: z.enum(["percentage", "fixed"]).optional(),
  tdDiscountValue: z.string().optional(),
  usageLimit: z.string().optional(),
  validUntil: z.string().optional(),
});

const productSchema = insertListingSchema.extend({
  title: z.string().min(1, "Product name is required"),
  price: z.string().min(1, "Price is required"),
  inventory: z.string().min(1, "Stock quantity is required"),
  customCategory: z.string().optional(),
  status: z.enum(["draft", "published", "pending", "rejected"]),
  createCoupon: z.boolean().optional(),
  coupon: couponSchema.optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  editProduct?: any;
}

export default function AddProductModal({ isOpen, onClose, editProduct }: AddProductModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isEditing = !!editProduct;
  const [imageUrl, setImageUrl] = useState<string>("");
  const [createCoupon, setCreateCoupon] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      type: "product",
      title: "",
      description: "",
      customCategory: "",
      price: "",
      inventory: "",
      status: "pending",
      createCoupon: false,
      coupon: {
        code: "",
        title: "",
        description: "",
        discountType: "cash",
        cashDiscountType: "percentage",
        cashDiscountValue: "",
        usageLimit: "",
        validUntil: "",
      },
    },
  });

  const discountType = form.watch("coupon.discountType");

  useEffect(() => {
    if (isOpen && editProduct) {
      form.reset({
        type: "product",
        title: editProduct.title || "",
        description: editProduct.description || "",
        customCategory: editProduct.customCategory || "",
        price: editProduct.price?.toString() || "",
        inventory: editProduct.inventory?.toString() || "",
        status: editProduct.status || "pending",
        createCoupon: false,
      });
      setImageUrl(editProduct.images?.[0] || "");
      setCreateCoupon(false);
    } else if (isOpen && !editProduct) {
      form.reset({
        type: "product",
        title: "",
        description: "",
        customCategory: "",
        price: "",
        inventory: "",
        status: "pending",
        createCoupon: false,
        coupon: {
          code: "",
          title: "",
          description: "",
          discountType: "cash",
          cashDiscountType: "percentage",
          cashDiscountValue: "",
          usageLimit: "",
          validUntil: "",
        },
      });
      setImageUrl("");
      setCreateCoupon(false);
    }
  }, [isOpen, editProduct, form]);

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
        price: data.price,
        inventory: parseInt(data.inventory),
        images: imageUrl ? [imageUrl] : [],
        status: isEditing ? editProduct.status : "pending",
      };
      const res = await apiRequest(
        isEditing ? "PUT" : "POST",
        isEditing ? `/api/listings/${editProduct.id}` : "/api/listings",
        productData
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings/user'] });
      toast({ 
        title: isEditing ? "Product updated successfully!" : "Product added successfully!",
        description: isEditing ? "Your changes have been saved and will be reviewed." : "Your product has been submitted for review.",
      });
      form.reset();
      setImageUrl("");
      onClose();
    },
    onError: (error: Error) => {
      toast({ 
        title: isEditing ? "Failed to update product" : "Failed to add product", 
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

  const onSubmit = (data: ProductFormData) => {
    createProductMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update your product details below." 
              : "Add a product to your marketplace"
            }
          </DialogDescription>
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
            <Label htmlFor="customCategory">Category</Label>
            <Input
              id="customCategory"
              {...form.register("customCategory")}
              placeholder="e.g., Electronics, Mobile Accessories, Smart Devices"
              data-testid="input-customCategory"
            />
            <p className="text-xs text-muted-foreground">
              Enter categories separated by commas. You can create new categories freely.
            </p>
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

          {!isEditing && (
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="createCoupon"
                  checked={createCoupon}
                  onCheckedChange={(checked) => {
                    setCreateCoupon(checked as boolean);
                    form.setValue("createCoupon", checked as boolean);
                  }}
                  data-testid="checkbox-create-coupon"
                />
                <Label htmlFor="createCoupon" className="flex items-center gap-2 cursor-pointer">
                  <Tag className="w-4 h-4" />
                  Create a coupon for this product
                </Label>
              </div>

              {createCoupon && (
                <div className="space-y-4 pl-6 border-l-2 border-gray-200 dark:border-gray-700">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="coupon.code">Coupon Code *</Label>
                      <Input
                        id="coupon.code"
                        {...form.register("coupon.code")}
                        placeholder="e.g., SAVE20"
                        data-testid="input-coupon-code"
                      />
                      {form.formState.errors.coupon?.code && (
                        <p className="text-sm text-red-500">{form.formState.errors.coupon.code.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="coupon.title">Coupon Title *</Label>
                      <Input
                        id="coupon.title"
                        {...form.register("coupon.title")}
                        placeholder="e.g., 20% Off"
                        data-testid="input-coupon-title"
                      />
                      {form.formState.errors.coupon?.title && (
                        <p className="text-sm text-red-500">{form.formState.errors.coupon.title.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coupon.description">Coupon Description</Label>
                    <Textarea
                      id="coupon.description"
                      {...form.register("coupon.description")}
                      placeholder="Describe the coupon offer..."
                      rows={2}
                      data-testid="textarea-coupon-description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coupon.discountType">Discount Type *</Label>
                    <Controller
                      name="coupon.discountType"
                      control={form.control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger data-testid="select-discount-type">
                            <SelectValue placeholder="Select discount type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash Only</SelectItem>
                            <SelectItem value="timedollar">TimeDollar Only</SelectItem>
                            <SelectItem value="both">Both Cash & TimeDollar</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {(discountType === "cash" || discountType === "both") && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="coupon.cashDiscountType">Cash Discount Type</Label>
                        <Controller
                          name="coupon.cashDiscountType"
                          control={form.control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger data-testid="select-cash-discount-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="coupon.cashDiscountValue">Cash Discount Value</Label>
                        <Input
                          id="coupon.cashDiscountValue"
                          type="number"
                          step="0.01"
                          {...form.register("coupon.cashDiscountValue")}
                          placeholder="e.g., 20"
                          data-testid="input-cash-discount-value"
                        />
                      </div>
                    </div>
                  )}

                  {(discountType === "timedollar" || discountType === "both") && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="coupon.tdDiscountType">TimeDollar Discount Type</Label>
                        <Controller
                          name="coupon.tdDiscountType"
                          control={form.control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger data-testid="select-td-discount-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="coupon.tdDiscountValue">TimeDollar Discount Value</Label>
                        <Input
                          id="coupon.tdDiscountValue"
                          type="number"
                          step="0.01"
                          {...form.register("coupon.tdDiscountValue")}
                          placeholder="e.g., 10"
                          data-testid="input-td-discount-value"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="coupon.usageLimit">Usage Limit</Label>
                      <Input
                        id="coupon.usageLimit"
                        type="number"
                        {...form.register("coupon.usageLimit")}
                        placeholder="e.g., 100 (leave empty for unlimited)"
                        data-testid="input-usage-limit"
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum number of times this coupon can be used
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="coupon.validUntil">Valid Until</Label>
                      <Input
                        id="coupon.validUntil"
                        type="date"
                        {...form.register("coupon.validUntil")}
                        data-testid="input-valid-until"
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave empty for no expiration
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createProductMutation.isPending}
              data-testid="button-submit"
            >
              {createProductMutation.isPending 
                ? (isEditing ? "Updating..." : "Adding...") 
                : (isEditing ? "Update Product" : "Add Product")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
