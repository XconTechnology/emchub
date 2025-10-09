import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, X, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadProps {
  onUploadSuccess: (url: string) => void;
  currentUrl?: string;
  onRemove?: () => void;
  label: string;
  accept?: string;
  testId?: string;
}

export function DocumentUpload({ 
  onUploadSuccess, 
  currentUrl, 
  onRemove, 
  label,
  accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  testId
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Step 1: Get upload URL
      const uploadResponse = await fetch('/api/vendor/upload', {
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
          'Content-Type': file.type || 'application/octet-stream',
        },
      });

      if (!uploadResult.ok) {
        throw new Error('Failed to upload file');
      }

      // Step 3: Set ACL and get object path
      const documentResponse = await fetch('/api/vendor/document', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          imageURL: uploadURL,
        }),
      });

      if (!documentResponse.ok) {
        throw new Error('Failed to process document');
      }

      const { objectPath } = await documentResponse.json();

      toast({
        title: "Success!",
        description: "Document uploaded successfully",
      });

      onUploadSuccess(objectPath);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  return (
    <div className="border-2 border-dashed rounded-lg p-4">
      {!currentUrl ? (
        <>
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id={`doc-upload-${label.replace(/\s+/g, '-')}`}
            data-testid={testId}
            disabled={isUploading}
          />
          <label htmlFor={`doc-upload-${label.replace(/\s+/g, '-')}`}>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isUploading}
              asChild
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
                    {label}
                  </>
                )}
              </span>
            </Button>
          </label>
        </>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm text-green-600 dark:text-green-400">✓ Document uploaded</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
