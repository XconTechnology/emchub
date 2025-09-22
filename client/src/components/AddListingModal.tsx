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
import { Store, MapPin, Phone, Mail, Globe, Clock, DollarSign, Tag, Calendar, Users, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Category } from "@shared/schema";

type AddListingData = z.infer<typeof insertListingSchema>;

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const listingTypes = [
  { value: "business", label: "Business", icon: Store },
  { value: "product", label: "Product", icon: Package },
  { value: "service", label: "Service", icon: Clock },
  { value: "event", label: "Event", icon: Calendar },
];

export default function AddListingModal({ isOpen, onClose }: AddListingModalProps) {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string>("business");

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
      // Transform form data for the API
      const transformedData = {
        ...data,
        type: selectedType,
        // Convert string dates to proper format if provided
        eventDate: data.eventDate || null,
        eventEndDate: data.eventEndDate || null,
      };

      console.log('Sending to API:', transformedData);

      const response = await fetch("/api/listings", {
        method: "POST",
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
        title: "Listing added successfully!",
        description: "Your listing has been submitted for review.",
      });
      onClose();
      form.reset();
      setSelectedType("business");
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
    console.log('Selected type:', selectedType);
    addListingMutation.mutate(data);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    form.setValue("type", type);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Add New Listing
          </DialogTitle>
          <DialogDescription>
            Add your business, product, service, or event to our directory to connect with the Hong Kong ethnic minority community.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Type Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Listing Type</h3>
            <div className="grid grid-cols-2 gap-3">
              {listingTypes.map((type) => (
                <div key={type.value} className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                  selectedType === type.value ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
                }`} onClick={() => handleTypeChange(type.value)}>
                  <div className="flex items-center gap-2">
                    <type.icon className="h-5 w-5" />
                    <span className="font-medium">{type.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <div className="relative">
                <Store className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="title"
                  placeholder={`Enter your ${selectedType} name`}
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
                placeholder={`Describe your ${selectedType}, what makes it special, and what you offer...`}
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

          {/* Type-specific fields */}
          {selectedType === 'product' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Product Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-10"
                      data-testid="input-price"
                      {...form.register("price")}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inventory">Inventory</Label>
                  <Input
                    id="inventory"
                    type="number"
                    placeholder="0"
                    data-testid="input-inventory"
                    {...form.register("inventory", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>
          )}

          {selectedType === 'service' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Service Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="duration"
                      type="number"
                      placeholder="60"
                      className="pl-10"
                      data-testid="input-duration"
                      {...form.register("duration", { valueAsNumber: true })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-10"
                      data-testid="input-service-price"
                      {...form.register("price")}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedType === 'event' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Event Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Event Date</Label>
                  <Input
                    id="eventDate"
                    type="datetime-local"
                    data-testid="input-event-date"
                    {...form.register("eventDate")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventEndDate">End Date (Optional)</Label>
                  <Input
                    id="eventEndDate"
                    type="datetime-local"
                    data-testid="input-event-end-date"
                    {...form.register("eventEndDate")}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="capacity"
                      type="number"
                      placeholder="50"
                      className="pl-10"
                      data-testid="input-capacity"
                      {...form.register("capacity", { valueAsNumber: true })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventPrice">Ticket Price ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="eventPrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-10"
                      data-testid="input-event-price"
                      {...form.register("eventPrice")}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

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
              {addListingMutation.isPending ? "Adding..." : `Add ${selectedType}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}