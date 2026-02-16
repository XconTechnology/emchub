import type { File } from "@google-cloud/storage";
import type { Response } from "express";
import type { ObjectAclPolicy } from "../objectAcl";
import type { IObjectStorageService, IStorageFile } from "./types";
import {
  ObjectStorageService as ReplitObjectStorageService,
  objectStorageClient,
} from "../objectStorage";

function gcsFileToStorageFile(file: File): IStorageFile & { _gcsFile: File } {
  return {
    _gcsFile: file,
    createReadStream: () => file.createReadStream(),
    getMetadata: async () => {
      const [m] = await file.getMetadata();
      return { contentType: m.contentType, size: Number(m.size) };
    },
    exists: () => file.exists().then(([x]) => x),
  };
}

export class ReplitObjectStorageAdapter implements IObjectStorageService {
  private service: ReplitObjectStorageService;

  constructor() {
    this.service = new ReplitObjectStorageService();
  }

  async getObjectEntityUploadURL(): Promise<string> {
    return this.service.getObjectEntityUploadURL();
  }

  async getObjectEntityFile(objectPath: string): Promise<IStorageFile> {
    const file = await this.service.getObjectEntityFile(objectPath);
    return gcsFileToStorageFile(file);
  }

  async downloadObject(
    file: IStorageFile,
    res: Response,
    cacheTtlSec = 3600,
  ): Promise<void> {
    const wrapped = file as IStorageFile & { _gcsFile?: File };
    if (wrapped._gcsFile) {
      return this.service.downloadObject(wrapped._gcsFile, res, cacheTtlSec);
    }
    throw new Error("Replit adapter requires GCS file");
  }

  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy,
  ): Promise<string> {
    return this.service.trySetObjectEntityAclPolicy(rawPath, aclPolicy);
  }

  normalizeObjectEntityPath(rawPath: string): string {
    return this.service.normalizeObjectEntityPath(rawPath);
  }

  async downloadByUrl(url: string, res: Response): Promise<void> {
    if (!url.startsWith("https://storage.googleapis.com/")) {
      return res.status(400).json({ message: "Invalid storage URL" });
    }
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    if (pathParts.length < 2) {
      return res.status(400).json({ message: "Invalid URL path" });
    }
    const bucketName = pathParts[0];
    const objectPath = pathParts.slice(1).join("/");
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(objectPath);
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ message: "Document not found" });
    }
    const [metadata] = await file.getMetadata();
    res.set({
      "Content-Type": metadata.contentType || "application/octet-stream",
      "Content-Length": String(metadata.size || 0),
    });
    file.createReadStream().pipe(res);
  }

  async getDocumentAsDataUrl(
    url: string
  ): Promise<{ url: string; contentType: string; fileName: string }> {
    if (!url.startsWith("https://storage.googleapis.com/")) {
      throw new Error("Invalid storage URL");
    }
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);
    if (pathParts.length < 2) throw new Error("Invalid URL path");
    const bucketName = pathParts[0];
    const objectPath = pathParts.slice(1).join("/");
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(objectPath);
    const [exists] = await file.exists();
    if (!exists) throw new Error("Document not found");
    const [metadata] = await file.getMetadata();
    const [content] = await file.download();
    const contentType = metadata.contentType || "application/octet-stream";
    const fileName = objectPath.split("/").pop() || "document";
    const base64 = content.toString("base64");
    return {
      url: `data:${contentType};base64,${base64}`,
      contentType,
      fileName,
    };
  }
}
