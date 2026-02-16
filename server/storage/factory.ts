import { getStorageProvider } from "../../config/deployment";
import type { IObjectStorageService } from "./types";
import { S3ObjectStorageService } from "./s3";

let _instance: IObjectStorageService | null = null;

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
  }
}

export async function initObjectStorage(): Promise<void> {
  if (_instance) return;
  if (getStorageProvider() === "s3") {
    _instance = new S3ObjectStorageService();
    return;
  }
  const { ReplitObjectStorageAdapter } = await import("./replit-adapter");
  _instance = new ReplitObjectStorageAdapter();
}

export function getObjectStorage(): IObjectStorageService {
  if (!_instance) {
    throw new Error(
      "Object storage not initialized. Call initObjectStorage() before registerRoutes."
    );
  }
  return _instance;
}
