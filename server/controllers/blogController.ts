// server/controllers/blogController.ts

import { Request, Response } from "express";
import { db } from "../db"; 
import { blogs, insertBlogSchema, updateBlogSchema } from "../../shared/schema"; 
import { eq, desc, ilike, or, and } from "drizzle-orm";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseValidationError(err: unknown): string {
  if (err instanceof z.ZodError) {
    return err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
  }
  return "Validation failed";
}

// ─── GET /api/admin/blogs ─────────────────────────────────────────────────────

export async function getBlogs(req: Request, res: Response) {
  try {
    const { search, status, page = "1", limit = "20" } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    let query = db.select().from(blogs);

    const conditions = [];
    if (search) {
      conditions.push(
        or(
          ilike(blogs.title, `%${search}%`),
          ilike(blogs.slug, `%${search}%`),
          ilike(blogs.excerpt, `%${search}%`)
        )
      );
    }
    if (status && (status === "draft" || status === "published")) {
      conditions.push(eq(blogs.status, status));
    }

    const results = await db
      .select()
      .from(blogs)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(blogs.createdAt))
      .limit(limitNum)
      .offset(offset);

    res.json({ blogs: results, page: pageNum, limit: limitNum });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
}

// ─── GET /api/admin/blogs/:id ──────────────────────────────────────────────────

export async function getBlogById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const [blog] = await db.select().from(blogs).where(eq(blogs.id, id));

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ message: "Failed to fetch blog" });
  }
}

// ─── POST /api/admin/blogs ────────────────────────────────────────────────────

export async function createBlog(req: any, res: Response) {
  try {
    const parsed = insertBlogSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parseValidationError(parsed.error) });
    }

    const data = parsed.data;

    // Auto-generate slug if not provided
    if (!data.slug) {
      data.slug = generateSlug(data.title);
    }

    // Check slug uniqueness
    const [existing] = await db.select().from(blogs).where(eq(blogs.slug, data.slug));
    if (existing) {
      return res.status(409).json({ message: "A blog with this slug already exists" });
    }

    const now = new Date();
    const [created] = await db
      .insert(blogs)
      .values({
        ...data,
        id: uuidv4(),
        createdBy: req.user?.id ?? null,
        publishedAt: data.status === "published" ? now : null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    res.status(201).json(created);
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: "Failed to create blog" });
  }
}

// ─── PUT /api/admin/blogs/:id ──────────────────────────────────────────────────

export async function updateBlog(req: any, res: Response) {
  try {
    const { id } = req.params;

    const [existing] = await db.select().from(blogs).where(eq(blogs.id, id));
    if (!existing) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const parsed = updateBlogSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parseValidationError(parsed.error) });
    }

    const data = parsed.data;

    // If slug changed, ensure uniqueness
    if (data.slug && data.slug !== existing.slug) {
      const [slugConflict] = await db
        .select()
        .from(blogs)
        .where(eq(blogs.slug, data.slug));
      if (slugConflict) {
        return res.status(409).json({ message: "A blog with this slug already exists" });
      }
    }

    // Set publishedAt when transitioning to published
    const publishedAt =
      data.status === "published" && existing.status !== "published"
        ? new Date()
        : existing.publishedAt;

    const [updated] = await db
      .update(blogs)
      .set({ ...data, publishedAt, updatedAt: new Date() })
      .where(eq(blogs.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ message: "Failed to update blog" });
  }
}

// ─── DELETE /api/admin/blogs/:id ──────────────────────────────────────────────

export async function deleteBlog(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const [deleted] = await db.delete(blogs).where(eq(blogs.id, id)).returning();

    if (!deleted) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json({ message: "Blog deleted successfully", id });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ message: "Failed to delete blog" });
  }
}

// ─── POST /api/admin/blogs/upload-image ───────────────────────────────────────
// Example stub — wire up to your storage provider (S3, Cloudinary, etc.)

export async function uploadBlogImage(req: any, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // TODO: Replace with real storage upload (S3/Cloudinary/etc.)
    const fakeUrl = `/uploads/blogs/${Date.now()}-${req.file.originalname}`;

    res.json({ url: fakeUrl });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Failed to upload image" });
  }
}