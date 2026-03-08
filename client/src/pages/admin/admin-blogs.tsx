import React, { useState, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PlusCircle,
  Pencil,
  Trash2,
  Eye,
  FileText,
  Globe,
  Image as ImageIcon,
  Link2,
  Code2,
  ChevronLeft,
  Search,
  LayoutList,
  CheckCircle2,
  Clock,
  X,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  UploadCloud,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type BlogStatus = "draft" | "published";

interface InternalLink {
  label: string;
  url: string;
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  schemaMarkup?: Record<string, unknown>;
  internalLinks?: InternalLink[];
  status: BlogStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Zod validation ───────────────────────────────────────────────────────────

const blogFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  slug: z
    .string()
    .min(3, "Slug required")
    .max(255)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Lowercase letters, numbers and hyphens only",
    ),
  excerpt: z.string().max(500).optional().or(z.literal("")),
  content: z.string().min(1, "Content is required"),
  metaTitle: z.string().max(160).optional().or(z.literal("")),
  metaDescription: z.string().max(320).optional().or(z.literal("")),
  featuredImage: z.string().optional().or(z.literal("")),
  featuredImageAlt: z.string().max(255).optional().or(z.literal("")),
  schemaMarkup: z.string().optional().or(z.literal("")), // raw JSON string in form
  internalLinks: z
    .array(
      z.object({
        label: z.string().min(1, "Label required"),
        url: z.string().url("Must be a valid URL"),
      }),
    )
    .optional(),
  status: z.enum(["draft", "published"]),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

// ─── API helpers ──────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: "include", ...options });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? "Request failed");
  }
  return res.json();
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ─── Minimal Rich-Text Toolbar ────────────────────────────────────────────────

const TOOLBAR_ACTIONS = [
  { icon: Bold, label: "Bold", wrap: ["**", "**"] },
  { icon: Italic, label: "Italic", wrap: ["_", "_"] },
  { icon: Heading1, label: "H1", prefix: "# " },
  { icon: Heading2, label: "H2", prefix: "## " },
  { icon: Heading3, label: "H3", prefix: "### " },
  { icon: List, label: "Bullet List", prefix: "- " },
  { icon: ListOrdered, label: "Numbered List", prefix: "1. " },
  { icon: Quote, label: "Blockquote", prefix: "> " },
  { icon: Minus, label: "Divider", insert: "\n---\n" },
];

interface ContentEditorProps {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  value,
  onChange,
  error,
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  const applyFormat = (action: (typeof TOOLBAR_ACTIONS)[number]) => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);

    let newVal = value;
    let cursor = end;

    if ("insert" in action && action.insert) {
      newVal = value.slice(0, start) + action.insert + value.slice(end);
      cursor = start + action.insert.length;
    } else if ("wrap" in action && action.wrap) {
      const [open, close] = action.wrap;
      newVal =
        value.slice(0, start) + open + selected + close + value.slice(end);
      cursor = start + open.length + selected.length + close.length;
    } else if ("prefix" in action && action.prefix) {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      newVal =
        value.slice(0, lineStart) + action.prefix + value.slice(lineStart);
      cursor = start + action.prefix.length;
    }

    onChange(newVal);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="flex flex-col gap-0">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 border border-b-0 border-border rounded-t-md bg-muted/40 px-2 py-1.5">
        {TOOLBAR_ACTIONS.map((action) => (
          <TooltipProvider key={action.label} delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => applyFormat(action)}
                  className="p-1.5 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                >
                  <action.icon className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {action.label}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        <span className="ml-auto text-[10px] text-muted-foreground self-center pr-1">
          Markdown supported
        </span>
      </div>
      {/* Editor */}
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your blog content here... Markdown is supported."
        className={`min-h-[340px] rounded-t-none font-mono text-sm resize-y leading-relaxed ${error ? "border-destructive" : ""}`}
      />
      {error && (
        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
      <p className="text-xs text-muted-foreground mt-1">
        {value.length} characters · ~
        {Math.ceil(value.split(/\s+/).filter(Boolean).length / 200)} min read
      </p>
    </div>
  );
};

// ─── Character counter helper ─────────────────────────────────────────────────

const CharCount: React.FC<{ current: number; max: number }> = ({
  current,
  max,
}) => (
  <span
    className={`text-[10px] tabular-nums ${current > max * 0.9 ? (current > max ? "text-destructive" : "text-amber-500") : "text-muted-foreground"}`}
  >
    {current}/{max}
  </span>
);

// ─── Section wrapper ──────────────────────────────────────────────────────────

const Section: React.FC<{
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}> = ({ icon: Icon, title, children }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
      <Icon className="h-4 w-4 text-primary" />
      {title}
    </div>
    {children}
  </div>
);

// ─── Blog Form ────────────────────────────────────────────────────────────────

interface BlogFormProps {
  blog?: Blog;
  onSuccess: () => void;
  onCancel: () => void;
}

const BlogForm: React.FC<BlogFormProps> = ({ blog, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!blog;
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: blog?.title ?? "",
      slug: blog?.slug ?? "",
      excerpt: blog?.excerpt ?? "",
      content: blog?.content ?? "",
      metaTitle: blog?.metaTitle ?? "",
      metaDescription: blog?.metaDescription ?? "",
      featuredImage: blog?.featuredImage ?? "",
      featuredImageAlt: blog?.featuredImageAlt ?? "",
      schemaMarkup: blog?.schemaMarkup
        ? JSON.stringify(blog.schemaMarkup, null, 2)
        : "",
      internalLinks: blog?.internalLinks ?? [],
      status: blog?.status ?? "draft",
    },
  });

  const {
    fields: linkFields,
    append: appendLink,
    remove: removeLink,
  } = useFieldArray({ control: form.control, name: "internalLinks" });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const watchTitle = watch("title");
  const watchSlug = watch("slug");
  const watchMetaTitle = watch("metaTitle") ?? "";
  const watchMetaDescription = watch("metaDescription") ?? "";
  const watchContent = watch("content");
  const watchStatus = watch("status");

  // Auto-fill slug from title (only when creating)
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("title", val);
    if (!isEditing || watchSlug === "") {
      setValue("slug", generateSlug(val), { shouldValidate: true });
    }
  };

  // Image upload
  const handleImageUpload = useCallback(
    async (file: File) => {
      setImageUploading(true);
      try {
        const fd = new FormData();
        fd.append("image", file);
        const res = await fetch("/api/admin/blogs/upload-image", {
          method: "POST",
          credentials: "include",
          body: fd,
        });
        if (!res.ok) throw new Error("Upload failed");
        const { url } = await res.json();
        setValue("featuredImage", url);
        toast({ title: "Image uploaded" });
      } catch {
        toast({ title: "Upload failed", variant: "destructive" });
      } finally {
        setImageUploading(false);
      }
    },
    [setValue, toast],
  );

  const saveMutation = useMutation({
    mutationFn: async (values: BlogFormValues) => {
      // Parse schemaMarkup JSON string → object
      let schemaMarkup: Record<string, unknown> | undefined;
      if (values.schemaMarkup?.trim()) {
        try {
          schemaMarkup = JSON.parse(values.schemaMarkup);
        } catch {
          throw new Error("Schema markup is not valid JSON");
        }
      }

      const payload = {
        ...values,
        schemaMarkup,
        featuredImage: values.featuredImage || undefined,
        excerpt: values.excerpt || undefined,
        metaTitle: values.metaTitle || undefined,
        metaDescription: values.metaDescription || undefined,
        featuredImageAlt: values.featuredImageAlt || undefined,
      };
      delete (payload as any).schemaMarkup; // remove string version
      Object.assign(payload, { schemaMarkup });

      if (isEditing) {
        return apiFetch<Blog>(`/api/admin/blogs/${blog.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      return apiFetch<Blog>("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blogs"] });
      toast({
        title: isEditing ? "Blog updated" : "Blog created",
        description:
          watchStatus === "published" ? "Published ✓" : "Saved as draft",
      });
      onSuccess();
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return (
    <form
      onSubmit={handleSubmit((v) => saveMutation.mutate(v))}
      className="space-y-8"
    >
      {/* ── Status bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="status-toggle"
              checked={watchStatus === "published"}
              onCheckedChange={(v) =>
                setValue("status", v ? "published" : "draft")
              }
            />
            <Label
              htmlFor="status-toggle"
              className="cursor-pointer text-sm font-medium"
            >
              {watchStatus === "published" ? (
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Published
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <Clock className="h-3.5 w-3.5" /> Draft
                </span>
              )}
            </Label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || saveMutation.isPending}
            className="min-w-[110px]"
          >
            {isSubmitting || saveMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Saving…
              </>
            ) : isEditing ? (
              "Update Blog"
            ) : (
              "Create Blog"
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="mb-6 h-9">
          <TabsTrigger value="content" className="gap-1.5 text-xs">
            <FileText className="h-3.5 w-3.5" /> Content
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-1.5 text-xs">
            <Globe className="h-3.5 w-3.5" /> SEO
          </TabsTrigger>
          <TabsTrigger value="media" className="gap-1.5 text-xs">
            <ImageIcon className="h-3.5 w-3.5" /> Media
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-1.5 text-xs">
            <Code2 className="h-3.5 w-3.5" /> Advanced
          </TabsTrigger>
        </TabsList>

        {/* ══ CONTENT TAB ══════════════════════════════════════════════════ */}
        <TabsContent value="content" className="space-y-6 mt-0">
          <Section icon={FileText} title="Post Details">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title">
                Blog Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                {...register("title")}
                onChange={handleTitleChange}
                placeholder="Enter a compelling blog title…"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.title.message}
                </p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <Label htmlFor="slug">
                URL Slug <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-0">
                <span className="inline-flex items-center px-3 h-9 text-xs text-muted-foreground bg-muted border border-r-0 rounded-l-md border-border">
                  /blog/
                </span>
                <Input
                  id="slug"
                  {...register("slug")}
                  placeholder="my-blog-post"
                  className={`rounded-l-none ${errors.slug ? "border-destructive" : ""}`}
                />
              </div>
              {errors.slug && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.slug.message}
                </p>
              )}
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="excerpt">Excerpt</Label>
                <CharCount current={watch("excerpt")?.length ?? 0} max={500} />
              </div>
              <Textarea
                id="excerpt"
                {...register("excerpt")}
                placeholder="A brief summary of the blog post (shown in listings)…"
                rows={3}
                className={errors.excerpt ? "border-destructive" : ""}
              />
              {errors.excerpt && (
                <p className="text-xs text-destructive">
                  {errors.excerpt.message}
                </p>
              )}
            </div>
          </Section>

          <Separator />

          {/* Content editor */}
          <Section icon={FileText} title="Content">
            <ContentEditor
              value={watchContent}
              onChange={(v) => setValue("content", v, { shouldValidate: true })}
              error={errors.content?.message}
            />
          </Section>
        </TabsContent>

        {/* ══ SEO TAB ══════════════════════════════════════════════════════ */}
        <TabsContent value="seo" className="space-y-6 mt-0">
          <Section icon={Globe} title="Search Engine Optimisation">
            {/* Meta title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <CharCount current={watchMetaTitle.length} max={60} />
              </div>
              <Input
                id="metaTitle"
                {...register("metaTitle")}
                placeholder="Ideal: 50–60 characters"
              />
              {/* Live SERP preview */}
              <div className="mt-3 rounded-md border bg-background p-3 space-y-0.5">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-2">
                  SERP Preview
                </p>
                <p className="text-sm font-medium text-[#1a0dab] dark:text-[#8ab4f8] line-clamp-1">
                  {watchMetaTitle || watchTitle || "Page title"}
                </p>
                <p className="text-[11px] text-[#006621] dark:text-[#4caf80]">
                  yourdomain.com/blog/{watchSlug || "slug"}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {watchMetaDescription ||
                    "No meta description set — add one below to improve click-through rates."}
                </p>
              </div>
            </div>

            {/* Meta description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <CharCount current={watchMetaDescription.length} max={160} />
              </div>
              <Textarea
                id="metaDescription"
                {...register("metaDescription")}
                placeholder="Ideal: 120–160 characters. Describe the page clearly."
                rows={3}
              />
            </div>
          </Section>
        </TabsContent>

        {/* ══ MEDIA TAB ════════════════════════════════════════════════════ */}
        <TabsContent value="media" className="space-y-6 mt-0">
          <Section icon={ImageIcon} title="Featured Image">
            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleImageUpload(file);
              }}
              className="group relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-10 cursor-pointer hover:border-primary hover:bg-muted/50 transition-all"
            >
              {imageUploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : watch("featuredImage") ? (
                <img
                  src={watch("featuredImage")}
                  alt="Featured"
                  className="max-h-40 rounded-md object-cover shadow"
                />
              ) : (
                <>
                  <UploadCloud className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      Drop an image or click to upload
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, WEBP up to 5 MB
                    </p>
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
            </div>

            {/* Or enter URL manually */}
            <div className="space-y-1.5">
              <Label htmlFor="featuredImage">— or paste image URL</Label>
              <Input
                id="featuredImage"
                {...register("featuredImage")}
                placeholder="https://example.com/image.jpg"
              />
              {errors.featuredImage && (
                <p className="text-xs text-destructive">
                  {errors.featuredImage.message}
                </p>
              )}
            </div>

            {/* Alt text */}
            <div className="space-y-1.5">
              <Label htmlFor="featuredImageAlt">Alt Text</Label>
              <Input
                id="featuredImageAlt"
                {...register("featuredImageAlt")}
                placeholder="Describe the image for accessibility and SEO"
              />
            </div>
          </Section>
        </TabsContent>

        {/* ══ ADVANCED TAB ═════════════════════════════════════════════════ */}
        <TabsContent value="advanced" className="space-y-6 mt-0">
          {/* Internal links */}
          <Section icon={Link2} title="Internal Links">
            <div className="space-y-3">
              {linkFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <div>
                      <Input
                        {...register(`internalLinks.${index}.label`)}
                        placeholder="Link label"
                        className={
                          errors.internalLinks?.[index]?.label
                            ? "border-destructive"
                            : ""
                        }
                      />
                      {errors.internalLinks?.[index]?.label && (
                        <p className="text-xs text-destructive mt-0.5">
                          {errors.internalLinks[index]?.label?.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Input
                        {...register(`internalLinks.${index}.url`)}
                        placeholder="https://yoursite.com/page"
                        className={
                          errors.internalLinks?.[index]?.url
                            ? "border-destructive"
                            : ""
                        }
                      />
                      {errors.internalLinks?.[index]?.url && (
                        <p className="text-xs text-destructive mt-0.5">
                          {errors.internalLinks[index]?.url?.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeLink(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendLink({ label: "", url: "" })}
                className="gap-1.5"
              >
                <PlusCircle className="h-3.5 w-3.5" /> Add Internal Link
              </Button>
            </div>
          </Section>

          <Separator />

          {/* Schema markup */}
          <Section icon={Code2} title="Schema Markup (JSON-LD)">
            <div className="space-y-1.5">
              <Label htmlFor="schemaMarkup">
                Paste your JSON-LD structured data
              </Label>
              <Textarea
                id="schemaMarkup"
                {...register("schemaMarkup")}
                placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "BlogPosting",\n  "headline": "Your blog title"\n}`}
                rows={10}
                className="font-mono text-xs"
              />
              {errors.schemaMarkup && (
                <p className="text-xs text-destructive">
                  {errors.schemaMarkup.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Must be valid JSON. This will be injected as a{" "}
                <code className="text-[10px] bg-muted px-1 rounded">
                  &lt;script type="application/ld+json"&gt;
                </code>{" "}
                tag.
              </p>
            </div>
          </Section>
        </TabsContent>
      </Tabs>

      {/* Bottom action bar */}
      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || saveMutation.isPending}
          className="min-w-[120px]"
        >
          {isSubmitting || saveMutation.isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Saving…
            </>
          ) : isEditing ? (
            "Update Blog"
          ) : (
            "Create Blog"
          )}
        </Button>
      </div>
    </form>
  );
};

// ─── Blogs List ───────────────────────────────────────────────────────────────

interface BlogsListResponse {
  blogs: Blog[];
  page: number;
  limit: number;
}

const AdminBlogs: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "draft" | "published"
  >("all");

  // ── Fetch blogs ─────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery<BlogsListResponse>({
    queryKey: [
      "/api/admin/blogs",
      { search: searchQuery, status: statusFilter },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);
      return apiFetch<BlogsListResponse>(
        `/api/admin/blogs${params.toString() ? `?${params.toString()}` : ""}`,
      );
    },
  });

  const blogs = data?.blogs ?? [];

  // ── Delete mutation ──────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/admin/blogs/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blogs"] });
      toast({ title: "Blog deleted" });
      setDeleteTarget(null);
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const openEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setView("edit");
  };

  const handleFormSuccess = () => {
    setView("list");
    setEditingBlog(null);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // ── Views ────────────────────────────────────────────────────────────────────
  if (view === "create" || view === "edit") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
        <button
          onClick={() => {
            setView("list");
            setEditingBlog(null);
          }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Blogs
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {view === "create" ? "New Blog Post" : "Edit Blog Post"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {view === "create"
              ? "Fill in the details to create a new post"
              : `Editing: ${editingBlog?.title}`}
          </p>
        </div>
        <BlogForm
          blog={editingBlog ?? undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setView("list");
            setEditingBlog(null);
          }}
        />
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and publish your blog content
          </p>
        </div>
        <Button onClick={() => setView("create")} className="gap-1.5">
          <PlusCircle className="h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Posts", value: blogs.length, icon: LayoutList },
          {
            label: "Published",
            value: blogs.filter((b) => b.status === "published").length,
            icon: CheckCircle2,
          },
          {
            label: "Drafts",
            value: blogs.filter((b) => b.status === "draft").length,
            icon: Clock,
          },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="shadow-sm">
            <CardContent className="flex items-center gap-3 py-4 px-5">
              <div className="p-2 rounded-md bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search posts…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(["all", "published", "draft"] as const).map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(s)}
                className="h-8 text-xs capitalize"
              >
                {s}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-semibold">Title</TableHead>
              <TableHead className="text-xs font-semibold">Slug</TableHead>
              <TableHead className="text-xs font-semibold">Status</TableHead>
              <TableHead className="text-xs font-semibold">Created</TableHead>
              <TableHead className="text-xs font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-muted-foreground text-sm"
                >
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Loading posts…
                </TableCell>
              </TableRow>
            ) : blogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-16 text-muted-foreground"
                >
                  <FileText className="h-8 w-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No posts found</p>
                  <p className="text-xs mt-1">
                    {searchQuery
                      ? "Try a different search"
                      : "Create your first blog post"}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog.id} className="group">
                  <TableCell className="font-medium text-sm max-w-[280px] truncate">
                    {blog.title}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                      /blog/{blog.slug}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        blog.status === "published" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {blog.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(blog.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {blog.status === "published" && (
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a
                                href={`/blog/${blog.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </a>
                            </TooltipTrigger>
                            <TooltipContent>View live</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEdit(blog)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteTarget(blog)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Delete dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete blog post?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>"{deleteTarget?.title}"</strong> will be permanently
              deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBlogs;
