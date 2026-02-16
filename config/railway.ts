/**
 * Railway-specific configuration.
 * Used when DEPLOYMENT_TARGET=railway.
 */
export const railwayConfig = {
  /** S3-compatible storage (AWS S3, Cloudflare R2, MinIO, etc.) */
  s3: {
    bucket: process.env.S3_BUCKET || process.env.AWS_S3_BUCKET || "",
    region: process.env.AWS_REGION || process.env.S3_REGION || "us-east-1",
    endpoint: process.env.S3_ENDPOINT || undefined, // For R2, MinIO: https://xxx.r2.cloudflarestorage.com
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  },

  /** Public URL base for served objects (e.g. https://your-app.railway.app) */
  publicUrl: process.env.RAILWAY_PUBLIC_DOMAIN || process.env.PUBLIC_URL || "",
};

export function getS3Config() {
  const { bucket, region, endpoint, forcePathStyle } = railwayConfig.s3;
  if (!bucket) {
    throw new Error(
      "S3_BUCKET or AWS_S3_BUCKET required for Railway deployment. " +
        "Set in Railway Variables."
    );
  }
  return {
    bucket,
    region,
    endpoint: endpoint || undefined,
    forcePathStyle: forcePathStyle || false,
  };
}
