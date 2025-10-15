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

const eventSchema = insertListingSchema.extend({
  title: z.string().min(1, "Event title is required"),
  eventDate: z.string().min(1, "Event date is required"),
  eventPrice: z.string().optional(),
  capacity: z.string().optional(),
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
  const [imageUrl, setImageUrl] = useState<string>(editEvent?.images?.[0] || "");

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: editEvent ? {
      type: "event",
      title: editEvent.title || "",
      description: editEvent.description || "",
      categoryId: editEvent.categoryId || "",
      eventDate: editEvent.eventDate ? new Date(editEvent.eventDate).toISOString().split('T')[0] : "",
      eventPrice: editEvent.eventPrice?.toString() || "",
      capacity: editEvent.capacity?.toString() || "",
      address: editEvent.address || "",
      status: editEvent.status || "pending",
    } : {
      type: "event",
      title: "",
      description: "",
      categoryId: "",
      eventDate: "",
      eventPrice: "",
      capacity: "",
      address: "",
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

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const eventData = {
        ...data,
        type: "event",
        userId: user?.id,
        eventDate: data.eventDate ? new Date(data.eventDate).toISOString() : undefined,
        eventPrice: data.eventPrice ? parseFloat(data.eventPrice) : undefined,
        capacity: data.capacity ? parseInt(data.capacity) : undefined,
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
        description: isEditing ? "Your changes have been saved and will be reviewed." : "Your event has been submitted for review.",
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

          <div className="space-y-2">
            <Label htmlFor="categoryId">Category *</Label>
            <Select 
              value={form.watch("categoryId") || ""} 
              onValueChange={(value) => form.setValue("categoryId", value)}
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

          <div className="space-y-2">
            <Label htmlFor="eventPrice">Price (Optional)</Label>
            <Input
              id="eventPrice"
              type="number"
              step="0.01"
              {...form.register("eventPrice")}
              placeholder="0.00"
              data-testid="input-event-price"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Location (Optional)</Label>
            <Input
              id="address"
              {...form.register("address")}
              placeholder="Event location address"
              data-testid="input-address"
            />
          </div>

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
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select 
              value={form.watch("status") || "draft"} 
              onValueChange={(value) => form.setValue("status", value as "draft" | "published")}
            >
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
