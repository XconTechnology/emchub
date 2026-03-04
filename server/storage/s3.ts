import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Response } from "express";
import { randomUUID } from "crypto";
import { Readable, PassThrough } from "stream";
import type { ObjectAclPolicy } from "../objectAcl";
import type { IObjectStorageService, IStorageFile } from "./types";
import { getS3Config } from "../../config/railway";

const UPLOAD_PREFIX = "uploads";
const OBJECT_PATH_PREFIX = "/objects";

class S3StorageFile implements IStorageFile {
  constructor(
    private client: S3Client,
    public readonly bucket: string,
    public readonly key: string
  ) {}

  createReadStream(): NodeJS.ReadableStream {
    const pass = new PassThrough();
    this.client
      .send(new GetObjectCommand({ Bucket: this.bucket, Key: this.key }))
      .then((resp) => {
        if (resp.Body) (resp.Body as Readable).pipe(pass);
        else pass.end();
      })
      .catch((err) => pass.destroy(err));
    return pass;
  }

  async getMetadata(): Promise<{ contentType?: string; size?: number }> {
    const command = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: this.key,
    });
    const resp = await this.client.send(command);
    return {
      contentType: resp.ContentType,
      size: resp.ContentLength,
    };
  }

  async exists(): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: this.key })
      );
      return true;
    } catch {
      return false;
    }
  }
}

export class S3ObjectStorageService implements IObjectStorageService {
  private client: S3Client;
  private bucket: string;

  constructor() {
    const config = getS3Config();
    this.bucket = config.bucket;
    this.client = new S3Client({
      region: config.region,
      credentials: config.credentials,
      ...(config.endpoint && { endpoint: config.endpoint }),
      ...(config.forcePathStyle && { forcePathStyle: true }),
    });
  }

  private objectKeyFromPath(objectPath: string): string {
    if (!objectPath.startsWith(OBJECT_PATH_PREFIX + "/")) {
      throw new Error(`Invalid object path: ${objectPath}`);
    }
    return objectPath.slice(OBJECT_PATH_PREFIX.length + 1);
  }

  async getObjectEntityUploadURL(): Promise<string> {
    const { uploadURL } = await this.getObjectEntityUploadURLWithPath();
    return uploadURL;
  }

  async getObjectEntityUploadURLWithPath(): Promise<{ uploadURL: string; objectPath: string }> {
    const objectId = randomUUID();
    const key = `${UPLOAD_PREFIX}/${objectId}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    const uploadURL = await getSignedUrl(this.client, command, { expiresIn: 900 });
    const objectPath = `${OBJECT_PATH_PREFIX}/${key}`;
    return { uploadURL, objectPath };
  }

  async getObjectEntityFile(objectPath: string): Promise<IStorageFile> {
    const key = this.objectKeyFromPath(objectPath);
    const file = new S3StorageFile(this.client, this.bucket, key);
    const exists = await file.exists();
    if (!exists) {
      const err = new Error("Object not found");
      (err as Error & { name?: string }).name = "ObjectNotFoundError";
      throw err;
    }
    return file;
  }

  async downloadObject(
    file: IStorageFile,
    res: Response,
    cacheTtlSec = 3600
  ): Promise<void> {
    const s3File = file as S3StorageFile;
    try {
      const metadata = await s3File.getMetadata();
      res.set({
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Cache-Control": `public, max-age=${cacheTtlSec}`,
      });
      const stream = s3File.createReadStream();
      stream.on("error", (err) => {
        console.error("Stream error:", err);
        if (!res.headersSent) res.status(500).json({ error: "Error streaming file" });
      });
      stream.pipe(res);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) res.status(500).json({ error: "Error downloading file" });
    }
  }

  normalizeObjectEntityPath(rawPath: string): string {
    if (!rawPath.startsWith("https://")) {
      return rawPath;
    }
    try {
      const url = new URL(rawPath);
      const pathname = url.pathname;
      const pathParts = pathname.split("/").filter(Boolean);
      if (pathParts.length === 0) return rawPath;
      let key: string;
      if (pathParts[0] === this.bucket) {
        key = pathParts.slice(1).join("/");
      } else if (url.hostname.includes(".s3.") || url.hostname.endsWith(".amazonaws.com")) {
        key = pathParts.join("/");
      } else {
        key = pathParts.join("/");
      }
      return `${OBJECT_PATH_PREFIX}/${key}`;
    } catch {
      return rawPath;
    }
  }

  async trySetObjectEntityAclPolicy(
    rawPath: string,
    _aclPolicy: ObjectAclPolicy
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith(OBJECT_PATH_PREFIX + "/")) {
      return normalizedPath;
    }
    const key = this.objectKeyFromPath(normalizedPath);
    const exists = await new S3StorageFile(
      this.client,
      this.bucket,
      key
    ).exists();
    if (!exists) {
      throw new Error(`Object not found: ${key}`);
    }
    return normalizedPath;
  }

  async downloadByUrl(url: string, res: Response): Promise<void> {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      if (pathParts.length < 2) {
        res.status(400).json({ message: "Invalid URL" });
        return;
      }
      const bucket = pathParts[0];
      const key = pathParts.slice(1).join("/");
      if (bucket !== this.bucket) {
        res.status(403).json({ message: "Access denied" });
        return;
      }
      const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
      const resp = await this.client.send(command);
      if (!resp.Body) {
        res.status(404).json({ message: "File not found" });
        return;
      }
      const contentType = resp.ContentType || "application/octet-stream";
      res.set({
        "Content-Type": contentType,
        "Content-Length": String(resp.ContentLength || 0),
      });
      (resp.Body as Readable).pipe(res);
    } catch (error) {
      console.error("S3 download error:", error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Download failed" });
      }
    }
  }

  async getDocumentAsDataUrl(
    url: string
  ): Promise<{ url: string; contentType: string; fileName: string }> {
    let key: string;
    if (url.startsWith(OBJECT_PATH_PREFIX + "/")) {
      key = this.objectKeyFromPath(url);
    } else {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      if (pathParts.length < 2) throw new Error("Invalid URL");
      const bucket = pathParts[0];
      key = pathParts.slice(1).join("/");
      if (bucket !== this.bucket) throw new Error("Access denied");
    }
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    const resp = await this.client.send(command);
    if (!resp.Body) throw new Error("File not found");
    const chunks: Buffer[] = [];
    for await (const chunk of resp.Body as AsyncIterable<Uint8Array>) {
      chunks.push(Buffer.from(chunk));
    }
    const content = Buffer.concat(chunks);
    const contentType = resp.ContentType || "application/octet-stream";
    const fileName = key.split("/").pop() || "document";
    const base64 = content.toString("base64");
    return {
      url: `data:${contentType};base64,${base64}`,
      contentType,
      fileName,
    };
  }
}
