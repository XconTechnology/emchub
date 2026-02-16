import type { Response } from "express";
import type { ObjectAclPolicy } from "../objectAcl";

/**
 * Storage-agnostic file handle for streaming/download.
 */
export interface IStorageFile {
  createReadStream(): NodeJS.ReadableStream;
  getMetadata(): Promise<{ contentType?: string; size?: number }>;
  exists(): Promise<boolean>;
}

/**
 * Object storage abstraction - implemented by Replit (GCS) or S3.
 */
export interface IObjectStorageService {
  getObjectEntityUploadURL(): Promise<string>;
  getObjectEntityFile(objectPath: string): Promise<IStorageFile>;
  downloadObject(file: IStorageFile, res: Response, cacheTtlSec?: number): Promise<void>;
  trySetObjectEntityAclPolicy(rawPath: string, aclPolicy: ObjectAclPolicy): Promise<string>;
  normalizeObjectEntityPath(rawPath: string): string;

  /** Download/stream a file by its full storage URL. */
  downloadByUrl?(url: string, res: Response): Promise<void>;

  /** Get document as base64 data URL for admin preview (vendor docs). */
  getDocumentAsDataUrl?(
    url: string
  ): Promise<{ url: string; contentType: string; fileName: string }>;
}
