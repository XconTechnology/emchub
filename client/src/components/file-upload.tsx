import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileCheck, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  label: string;
  accept?: string;
  onUploadComplete: (url: string) => void;
  value?: string;
  required?: boolean;
  testId?: string;
}

export function FileUpload({
  label,
  accept,
  onUploadComplete,
  value,
  required,
  testId,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(value || "");
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // ✅ Send file metadata so backend can sign the URL with the correct Content-Type
      const uploadUrlResponse = await fetch("/api/vendor/upload", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      if (!uploadUrlResponse.ok) {
        throw new Error("Failed to get upload URL");
      }

      const data = await uploadUrlResponse.json();
      const uploadURL = data.uploadURL ?? data.uploadUrl;
      let key = data.key ?? data.objectPath;

      // Fallback: derive object path from signed URL when server doesn't return key (e.g. old deploy)
      if (!key && uploadURL) {
        try {
          const u = new URL(uploadURL);
          const parts = u.pathname.split("/").filter(Boolean);
          const uploadsIdx = parts.indexOf("uploads");
          const keyParts = uploadsIdx >= 0 ? parts.slice(uploadsIdx) : parts;
          key = keyParts.length ? "/objects/" + keyParts.join("/") : "";
        } catch {
          key = "";
        }
      }

      // ✅ Content-Type matches what was signed — no S3 signature mismatch
      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      // ✅ Store the permanent object path for the form (e.g. /objects/uploads/uuid)
      setUploadedUrl(key || "");
      onUploadComplete(key || "");

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setUploadedUrl("");
    onUploadComplete("");
  };

  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {uploadedUrl ? (
        <div className="flex items-center gap-2 p-3 border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 rounded-md">
          <FileCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-700 dark:text-green-300 flex-1">
            File uploaded successfully
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={uploading}
            className="cursor-pointer"
            data-testid={testId}
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded-md">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Accepted formats: {accept || "PDF, JPG, PNG"}. Max size: 10MB
      </p>
    </div>
  );
}
