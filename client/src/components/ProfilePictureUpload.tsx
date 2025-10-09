import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface ProfilePictureUploadProps {
  currentImageUrl?: string | null;
  onUploadSuccess?: (imageUrl: string) => void;
}

export function ProfilePictureUpload({ currentImageUrl, onUploadSuccess }: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Step 1: Get upload URL
      const uploadResponse = await fetch('/api/profile/upload', {
        method: 'POST',
        credentials: 'include',
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadURL } = await uploadResponse.json();

      // Step 2: Upload file to object storage
      const uploadResult = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResult.ok) {
        throw new Error('Failed to upload file');
      }

      // Step 3: Set ACL and update profile
      const imageResponse = await fetch('/api/profile/image', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          imageURL: uploadURL,
        }),
      });

      if (!imageResponse.ok) {
        throw new Error('Failed to update profile image');
      }

      const { objectPath } = await imageResponse.json();

      toast({
        title: "Success!",
        description: "Profile picture updated successfully",
      });

      // Invalidate user query to refresh the profile
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });

      if (onUploadSuccess) {
        onUploadSuccess(objectPath);
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="profile-picture-upload"
        data-testid="input-profile-picture"
        disabled={isUploading}
      />
      <label htmlFor="profile-picture-upload">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          asChild
          data-testid="button-upload-profile-picture"
        >
          <span className="cursor-pointer">
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </>
            )}
          </span>
        </Button>
      </label>
    </div>
  );
}
