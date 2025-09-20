import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { BusinessListing } from "@shared/schema";
import { useEffect, useState } from "react";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listing: BusinessListing | null;
}

export default function DeleteConfirmationDialog({ isOpen, onClose, listing }: DeleteConfirmationDialogProps) {
  const { toast } = useToast();
  const [listingToDelete, setListingToDelete] = useState<BusinessListing | null>(null);

  // Capture the listing when dialog opens
  useEffect(() => {
    if (isOpen && listing) {
      setListingToDelete(listing);
    } else if (!isOpen) {
      setListingToDelete(null);
    }
  }, [isOpen, listing]);

  const deleteListingMutation = useMutation({
    mutationFn: async () => {
      if (!listingToDelete) throw new Error("No listing to delete");
      return apiRequest("DELETE", `/api/listings/${listingToDelete.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings/user'] });
      toast({
        title: "Success!",
        description: "Business listing deleted successfully.",
      });
      onClose();
    },
    onError: (error: any) => {
      console.error("Error deleting listing:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete business listing. Please try again.",
      });
    },
  });

  const handleDelete = () => {
    deleteListingMutation.mutate();
  };

  if (!listingToDelete) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Business Listing</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{listingToDelete.businessName}"? This action cannot be undone.
            Your business listing will be permanently removed from the directory.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="button-cancel-delete">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteListingMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
            data-testid="button-confirm-delete"
          >
            {deleteListingMutation.isPending ? "Deleting..." : "Delete Listing"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}