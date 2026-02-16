/**
 * Deployment configuration - determines which backend to use.
 * Set DEPLOYMENT_TARGET=railway for Railway, otherwise defaults to replit.
 */
export type DeploymentTarget = "replit" | "railway";
export type StorageProvider = "replit" | "s3";

export function getDeploymentTarget(): DeploymentTarget {
  return (process.env.DEPLOYMENT_TARGET as DeploymentTarget) || "replit";
}

export function getStorageProvider(): StorageProvider {
  const target = getDeploymentTarget();
  if (target === "railway") {
    return (process.env.STORAGE_PROVIDER as StorageProvider) || "s3";
  }
  return "replit";
}

export function isRailway(): boolean {
  return getDeploymentTarget() === "railway";
}

export function isReplit(): boolean {
  return getDeploymentTarget() === "replit";
}
