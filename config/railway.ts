/**
 * Railway-specific configuration.
 * Used when DEPLOYMENT_TARGET=railway.
 */
export const railwayConfig = {
  /** S3-compatible storage (AWS S3, Cloudflare R2, MinIO, etc.) */
  s3: {
    bucket: process.env.AWS_BUCKET || "",
    region: process.env.AWS_REGION || "us-east-1",
    endpoint: process.env.S3_ENDPOINT || undefined, // For R2, MinIO: https://xxx.r2.cloudflarestorage.com
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },

  /** Public URL base for served objects (e.g. https://your-app.railway.app) */
  publicUrl: process.env.RAILWAY_PUBLIC_DOMAIN || process.env.PUBLIC_URL || "",
};

export function getS3Config() {
  const {
    bucket,
    region,
    endpoint,
    forcePathStyle,
    accessKeyId,
    secretAccessKey,
  } = railwayConfig.s3;

  if (!bucket) {
    throw new Error(
      "AWS_BUCKET required for Railway deployment. Set in Railway Variables.",
    );
  }
  if (!accessKeyId) {
    throw new Error(
      "AWS_ACCESS_KEY_ID required for S3. Set in Railway Variables.",
    );
  }
  if (!secretAccessKey) {
    throw new Error(
      "AWS_SECRET_ACCESS_KEY required for S3. Set in Railway Variables.",
    );
  }

  return {
    bucket,
    region,
    endpoint: endpoint || undefined,
    forcePathStyle: forcePathStyle || false,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  };
}
