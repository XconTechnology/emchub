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

const eventSchema = insertListingSchema.extend({
  title: z.string().min(1, "Event title is required"),
  categoryId: z.string().optional(),
  eventDate: z.string().min(1, "Event date is required"),
  eventTime: z.string().min(1, "Event time is required"),
  locationType: z.enum(["in_person", "online", "hybrid"], {
    required_error: "Please select a location type",
  }),
  locationDetails: z.string().min(1, "Location details are required"),
  eventPrice: z.string().optional(),
  capacity: z.string().optional(),
  paymentType: z.enum(["cash_only", "timedollar_only", "both_choice", "combo"]).optional(),
  timedollarPercentage: z.string().optional(),
  status: z.enum(["draft", "published", "pending", "rejected"]),
});

type EventFormData = z.infer<typeof eventSchema>;

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  editEvent?: any;
}

export default function AddEventModal({ isOpen, onClose, editEvent }: AddEventModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isEditing = !!editEvent;
  const [imageUrl, setImageUrl] = useState<string>("");

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      type: "event",
      title: "",
      description: "",
      categoryId: undefined,
      eventDate: "",
      eventTime: "",
      locationType: "in_person",
      locationDetails: "",
      eventPrice: "",
      capacity: "",
      paymentType: "cash_only",
      timedollarPercentage: "",
      address: "",
      status: "pending",
    },
  });

  useEffect(() => {
    if (isOpen && editEvent) {
      const eventDateTime = editEvent.eventDate ? new Date(editEvent.eventDate) : null;
      form.reset({
        type: "event",
        title: editEvent.title || "",
        description: editEvent.description || "",
        categoryId: undefined,
        eventDate: eventDateTime ? eventDateTime.toISOString().split('T')[0] : "",
        eventTime: eventDateTime ? eventDateTime.toISOString().split('T')[1].substring(0, 5) : "",
        locationType: editEvent.isOnlineOnly ? "online" : (editEvent.address ? "in_person" : "in_person"),
        locationDetails: editEvent.address || editEvent.website || "",
        eventPrice: editEvent.eventPrice?.toString() || "",
        capacity: editEvent.capacity?.toString() || "",
        paymentType: editEvent.paymentType || "cash_only",
        timedollarPercentage: editEvent.timedollarPercentage?.toString() || "",
        address: editEvent.address || "",
        status: editEvent.status || "pending",
      });
      setImageUrl(editEvent.images?.[0] || "");
    } else if (isOpen && !editEvent) {
      form.reset({
        type: "event",
        title: "",
        description: "",
        categoryId: undefined,
        eventDate: "",
        eventTime: "",
        locationType: "in_person",
        locationDetails: "",
        eventPrice: "",
        capacity: "",
        paymentType: "cash_only",
        timedollarPercentage: "",
        address: "",
        status: "pending",
      });
      setImageUrl("");
    }
  }, [isOpen, editEvent, form]);

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

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const tdPercentage = data.timedollarPercentage ? parseInt(data.timedollarPercentage) : null;
      const cashPercentage = tdPercentage ? 100 - tdPercentage : null;
      
      // Combine date and time into eventDate timestamp and convert to Date object
      const eventDateTime = new Date(`${data.eventDate}T${data.eventTime}:00`);
      
      const eventData: any = {
        ...data,
        type: "event",
        userId: user?.id,
        eventDate: eventDateTime,
        eventPrice: data.eventPrice ? parseFloat(data.eventPrice) : undefined,
        capacity: data.capacity ? parseInt(data.capacity) : undefined,
        address: data.locationType !== "online" ? data.locationDetails : null,
        website: data.locationType === "online" ? data.locationDetails : null,
        isOnlineOnly: data.locationType === "online",
        paymentType: data.paymentType || "cash_only",
        timedollarPercentage: tdPercentage,
        cashPercentage: cashPercentage,
        images: imageUrl ? [imageUrl] : [],
        status: isEditing ? editEvent.status : "pending",
      };
      
      const res = await apiRequest(
        isEditing ? "PUT" : "POST",
        isEditing ? `/api/listings/${editEvent.id}` : "/api/listings",
        eventData
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings/user'] });
      toast({ 
        title: isEditing ? "Event updated successfully!" : "Event added successfully!",
        description: isEditing ? "Your changes have been saved and will be reviewed." : "Your event has been submitted for admin approval.",
      });
      form.reset();
      setImageUrl("");
      onClose();
    },
    onError: (error: Error) => {
      toast({ 
        title: isEditing ? "Failed to update event" : "Failed to add event", 
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

  const onSubmit = (data: EventFormData) => {
    createEventMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Event" : "Add New Event"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update your event details below." 
              : "Add an event to your marketplace"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="e.g., Community Festival"
              data-testid="input-event-title"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date *</Label>
              <Input
                id="eventDate"
                type="date"
                {...form.register("eventDate")}
                data-testid="input-event-date"
              />
              {form.formState.errors.eventDate && (
                <p className="text-sm text-red-500">{form.formState.errors.eventDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventTime">Event Time *</Label>
              <Input
                id="eventTime"
                type="time"
                {...form.register("eventTime")}
                data-testid="input-event-time"
              />
              {form.formState.errors.eventTime && (
                <p className="text-sm text-red-500">{form.formState.errors.eventTime.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationType">Location Type *</Label>
            <Select
              value={form.watch("locationType")}
              onValueChange={(value) => form.setValue("locationType", value as any)}
            >
              <SelectTrigger data-testid="select-location-type">
                <SelectValue placeholder="Select location type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_person">In-Person</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="hybrid">Hybrid (In-Person & Online)</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.locationType && (
              <p className="text-sm text-red-500">{form.formState.errors.locationType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationDetails">
              {form.watch("locationType") === "online" ? "Online Link (URL) *" : "Venue Address *"}
            </Label>
            <Input
              id="locationDetails"
              {...form.register("locationDetails")}
              placeholder={
                form.watch("locationType") === "online" 
                  ? "e.g., https://zoom.us/j/123456789" 
                  : "e.g., 123 Main Street, Hong Kong"
              }
              data-testid="input-location-details"
            />
            {form.formState.errors.locationDetails && (
              <p className="text-sm text-red-500">{form.formState.errors.locationDetails.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="eventPrice">Ticket Price (HK$) - Optional</Label>
              <Input
                id="eventPrice"
                type="number"
                step="0.01"
                {...form.register("eventPrice")}
                placeholder="0.00 (Leave blank for free)"
                data-testid="input-event-price"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank if the event is free
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (Optional)</Label>
              <Input
                id="capacity"
                type="number"
                {...form.register("capacity")}
                placeholder="Max attendees"
                data-testid="input-capacity"
              />
            </div>
          </div>

          {form.watch("eventPrice") && parseFloat(form.watch("eventPrice") || "0") > 0 && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
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
              </div>

              {form.watch("paymentType") === "combo" && (
                <div className="space-y-2">
                  <Label htmlFor="timedollarPercentage">TimeDollar Percentage *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="timedollarPercentage"
                      type="number"
                      min="1"
                      max="100"
                      {...form.register("timedollarPercentage")}
                      placeholder="50"
                      data-testid="input-td-percentage"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Percentage of ticket price to be paid in TimeDollar (1-100%)
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Describe your event..."
              rows={4}
              data-testid="textarea-description"
            />
          </div>

          <div className="space-y-2">
            <Label>Event Image</Label>
            {imageUrl ? (
              <div className="relative">
                <img src={imageUrl} alt="Event" className="w-full h-48 object-cover rounded-lg" />
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
            {uploadImageMutation.isPending && (
              <p className="text-sm text-gray-600">Uploading image...</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createEventMutation.isPending}
              data-testid="button-submit"
            >
              {createEventMutation.isPending 
                ? (isEditing ? "Updating..." : "Adding...") 
                : (isEditing ? "Update Event" : "Add Event")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
