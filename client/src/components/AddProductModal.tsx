import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertListingSchema } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Upload, X, Ticket } from "lucide-react";

const productSchema = insertListingSchema.extend({
  title: z.string().min(1, "Product name is required"),
  price: z.string().min(1, "Price is required"),
  inventory: z.string().min(1, "Stock quantity is required"),
  customCategory: z.string().optional(),
  status: z.enum(["draft", "published", "pending", "rejected"]),
  paymentType: z.enum(["cash_only", "timedollar_only", "both_choice", "combo"]).optional(),
  timedollarPercentage: z.string().optional(), // Percentage of price to be paid in TD (0-100)
  // Optional coupon fields
  createCoupon: z.boolean().optional(),
  couponCode: z.string().optional(),
  couponTitle: z.string().optional(),
  couponDiscountType: z.enum(["percentage", "fixed"]).optional(),
  couponDiscountValue: z.string().optional(),
  couponValidUntil: z.string().optional(),
  couponUsageLimit: z.string().optional(),
}).refine((data) => {
  // If creating a coupon, coupon fields are required
  if (data.createCoupon) {
    return data.couponCode && data.couponTitle && data.couponDiscountType && data.couponDiscountValue;
  }
  return true;
}, {
  message: "All coupon fields are required when creating a coupon",
  path: ["createCoupon"],
}).refine((data) => {
  // If payment type is combo, TD percentage is required
  if (data.paymentType === "combo") {
    const tdPercent = parseInt(data.timedollarPercentage || "0");
    return tdPercent > 0 && tdPercent <= 100;
  }
  return true;
}, {
  message: "TimeDollar percentage must be between 1 and 100 for combo payments",
  path: ["timedollarPercentage"],
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

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      type: "product",
      title: "",
      description: "",
      customCategory: "",
      price: "",
      inventory: "",
      paymentType: "cash_only",
      timedollarPercentage: "",
      status: "pending",
      createCoupon: false,
      couponCode: "",
      couponTitle: "",
      couponDiscountType: "percentage",
      couponDiscountValue: "",
      couponValidUntil: "",
      couponUsageLimit: "",
    },
  });

  const createCoupon = form.watch("createCoupon");

  // Fetch existing coupon for this product when editing
  const { data: productCoupon } = useQuery<any>({
    queryKey: ['/api/coupons/product', editProduct?.id],
    enabled: isOpen && isEditing && !!editProduct?.id,
  });

  useEffect(() => {
    if (isOpen && editProduct) {
      // Load product data
      form.reset({
        type: "product",
        title: editProduct.title || "",
        description: editProduct.description || "",
        customCategory: editProduct.customCategory || "",
        price: editProduct.price?.toString() || "",
        inventory: editProduct.inventory?.toString() || "",
        paymentType: editProduct.paymentType || "cash_only",
        timedollarPercentage: editProduct.timedollarPercentage?.toString() || "",
        status: editProduct.status || "pending",
        createCoupon: false, // Will be updated when coupon data loads
        couponCode: "",
        couponTitle: "",
        couponDiscountType: "percentage",
        couponDiscountValue: "",
        couponValidUntil: "",
        couponUsageLimit: "",
      });
      setImageUrl(editProduct.images?.[0] || "");
    } else if (isOpen && !editProduct) {
      form.reset({
        type: "product",
        title: "",
        description: "",
        customCategory: "",
        price: "",
        inventory: "",
        paymentType: "cash_only",
        timedollarPercentage: "",
        status: "pending",
        createCoupon: false,
        couponCode: "",
        couponTitle: "",
        couponDiscountType: "percentage",
        couponDiscountValue: "",
        couponValidUntil: "",
        couponUsageLimit: "",
      });
      setImageUrl("");
    }
  }, [isOpen, editProduct, form]);

  // Separate effect to update form when coupon data loads
  useEffect(() => {
    if (isEditing && productCoupon) {
      form.setValue("createCoupon", true);
      form.setValue("couponCode", productCoupon.code || "");
      form.setValue("couponTitle", productCoupon.title || "");
      form.setValue("couponDiscountType", productCoupon.discountType || "percentage");
      form.setValue("couponDiscountValue", productCoupon.discountValue?.toString() || "");
      form.setValue("couponValidUntil", productCoupon.validUntil ? new Date(productCoupon.validUntil).toISOString().split('T')[0] : "");
      form.setValue("couponUsageLimit", productCoupon.usageLimit?.toString() || "");
    }
  }, [productCoupon, isEditing, form]);

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
      const tdPercentage = data.timedollarPercentage ? parseInt(data.timedollarPercentage) : null;
      const cashPercentage = tdPercentage ? 100 - tdPercentage : null;
      
      const productData: any = {
        ...data,
        type: "product",
        userId: user?.id,
        price: data.price,
        inventory: parseInt(data.inventory),
        paymentType: data.paymentType || "cash_only",
        timedollarPercentage: tdPercentage,
        cashPercentage: cashPercentage,
        images: imageUrl ? [imageUrl] : [],
        status: isEditing ? editProduct.status : "pending",
      };

      // Add coupon data if creating a coupon
      if (data.createCoupon) {
        productData.coupon = {
          code: data.couponCode?.toUpperCase(),
          title: data.couponTitle,
          discountType: data.couponDiscountType,
          discountValue: parseFloat(data.couponDiscountValue || "0"),
          validUntil: data.couponValidUntil || null,
          usageLimit: data.couponUsageLimit ? parseInt(data.couponUsageLimit) : null,
        };
      }
      
      const res = await apiRequest(
        isEditing ? "PUT" : "POST",
        isEditing ? `/api/listings/${editProduct.id}` : "/api/listings",
        productData
      );
      return res.json();
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/coupons/vendor'] });
      
      const productMsg = isEditing ? "Your changes have been saved and will be reviewed." : "Your product has been submitted for review.";
      const couponMsg = response.couponCreated ? " Product coupon created and submitted for approval." : "";
      
      toast({ 
        title: isEditing ? "Product updated successfully!" : "Product added successfully!",
        description: productMsg + couponMsg,
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
              <Label htmlFor="price">Price (HK$) *</Label>
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

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentType">Payment Type *</Label>
              <Select
                value={form.watch("paymentType")}
                onValueChange={(value) => form.setValue("paymentType", value as any)}
              >
                <SelectTrigger data-testid="select-payment-type">
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash_only">Cash Only (HK$)</SelectItem>
                  <SelectItem value="timedollar_only">TimeDollar Only</SelectItem>
                  <SelectItem value="both_choice">Both (Customer Choice)</SelectItem>
                  <SelectItem value="combo">Combo (Custom % Split)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose how customers can pay for this product
              </p>
            </div>

            {form.watch("paymentType") === "combo" && (
              <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
                <Label htmlFor="timedollarPercentage">TimeDollar Percentage *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="timedollarPercentage"
                    type="number"
                    min="1"
                    max="100"
                    {...form.register("timedollarPercentage")}
                    placeholder="e.g., 10"
                    data-testid="input-td-percentage"
                  />
                  <span className="text-sm font-medium">%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Set what percentage of the price should be paid in TimeDollars. For example, if you set 10% and price is HK$100, customers will pay <strong>10 TD + HK$90</strong> (at 1 TD = 60 HK$ conversion).
                </p>
                {form.formState.errors.timedollarPercentage && (
                  <p className="text-sm text-red-500">{form.formState.errors.timedollarPercentage.message}</p>
                )}
                {form.watch("timedollarPercentage") && form.watch("price") && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Preview: Customers will pay {(parseFloat(form.watch("price") || "0") * parseInt(form.watch("timedollarPercentage") || "0") / 100 / 60).toFixed(2)} TD + HK${(parseFloat(form.watch("price") || "0") * (100 - parseInt(form.watch("timedollarPercentage") || "0")) / 100).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}
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

          <Separator className="my-6" />

          {/* Coupon Creation Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                <Label htmlFor="createCoupon" className="text-base font-semibold">
                  Create Product Coupon
                </Label>
              </div>
              <Switch
                id="createCoupon"
                checked={createCoupon || false}
                onCheckedChange={(checked) => form.setValue("createCoupon", checked)}
                data-testid="switch-create-coupon"
              />
            </div>

            {createCoupon && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Create a unique coupon for this product. Customers can apply this coupon at checkout to receive a discount on this item.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="couponCode">Coupon Code *</Label>
                    <Input
                      id="couponCode"
                      {...form.register("couponCode")}
                      placeholder="e.g., SAVE20"
                      className="uppercase"
                      data-testid="input-coupon-code"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="couponTitle">Coupon Title *</Label>
                    <Input
                      id="couponTitle"
                      {...form.register("couponTitle")}
                      placeholder="e.g., 20% Off"
                      data-testid="input-coupon-title"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="couponDiscountType">Discount Type *</Label>
                    <Select
                      value={form.watch("couponDiscountType")}
                      onValueChange={(value) => form.setValue("couponDiscountType", value as "percentage" | "fixed")}
                    >
                      <SelectTrigger data-testid="select-discount-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount (HK$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="couponDiscountValue">
                      Discount Value * {form.watch("couponDiscountType") === "percentage" ? "(%)" : "(HK$)"}
                    </Label>
                    <Input
                      id="couponDiscountValue"
                      type="number"
                      step={form.watch("couponDiscountType") === "percentage" ? "1" : "0.01"}
                      {...form.register("couponDiscountValue")}
                      placeholder={form.watch("couponDiscountType") === "percentage" ? "e.g., 20" : "e.g., 50.00"}
                      data-testid="input-discount-value"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="couponValidUntil">Valid Until (Optional)</Label>
                    <Input
                      id="couponValidUntil"
                      type="date"
                      {...form.register("couponValidUntil")}
                      data-testid="input-valid-until"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="couponUsageLimit">Usage Limit (Optional)</Label>
                    <Input
                      id="couponUsageLimit"
                      type="number"
                      {...form.register("couponUsageLimit")}
                      placeholder="e.g., 100"
                      data-testid="input-usage-limit"
                    />
                  </div>
                </div>
              </div>
            )}
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
