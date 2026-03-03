/**
 * Request presigned upload URL from the API for object/listing uploads.
 */
export async function getObjectUploadParameters(): Promise<{
  method: "PUT";
  url: string;
}> {
  const response = await fetch("/api/objects/upload", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to get upload URL");
  }

  const data = await response.json();
  const uploadURL = data?.uploadURL;
  if (!uploadURL) {
    throw new Error("Failed to get upload URL");
  }

  return { method: "PUT" as const, url: uploadURL };
}
