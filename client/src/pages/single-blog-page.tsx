import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import {
  ArrowLeft,
  Clock,
  Calendar,
  BookOpen,
  AlertCircle,
  Share2,
  Link2,
} from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InternalLink {
  label?: string;
  url?: string;
}

interface Blog {
  id: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  metaTitle?: string;
  metaDescription?: string;
  schemaMarkup?: Record<string, unknown>;
  internalLinks?: InternalLink[];
  status?: string;
  publishedAt?: string;
  createdAt?: string;
}

interface BlogsResponse {
  blogs: Blog[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readTime(content?: string): number {
  if (!content) return 1;
  return Math.max(
    1,
    Math.ceil(content.split(/\s+/).filter(Boolean).length / 200),
  );
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

// ─── Markdown → HTML renderer (no external deps) ─────────────────────────────
// Safe, minimal — handles headings, bold, italic, lists, blockquotes, code, hr, links

function renderMarkdown(md?: string): string {
  if (!md) return "";
  try {
    let html = md
      // Escape HTML entities first
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Headings
      .replace(/^#{6}\s+(.+)$/gm, "<h6>$1</h6>")
      .replace(/^#{5}\s+(.+)$/gm, "<h5>$1</h5>")
      .replace(/^#{4}\s+(.+)$/gm, "<h4>$1</h4>")
      .replace(/^#{3}\s+(.+)$/gm, "<h3>$1</h3>")
      .replace(/^#{2}\s+(.+)$/gm, "<h2>$1</h2>")
      .replace(/^#{1}\s+(.+)$/gm, "<h1>$1</h1>")
      // Blockquotes
      .replace(/^&gt;\s+(.+)$/gm, "<blockquote>$1</blockquote>")
      // HR
      .replace(/^---$/gm, "<hr />")
      // Bold + Italic
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/_(.+?)_/g, "<em>$1</em>")
      // Inline code
      .replace(/`(.+?)`/g, "<code>$1</code>")
      // Links [label](url)
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
      )
      // Unordered lists
      .replace(/^\s*[-*]\s+(.+)$/gm, "<li>$1</li>")
      // Ordered lists
      .replace(/^\s*\d+\.\s+(.+)$/gm, "<li>$1</li>")
      // Wrap consecutive <li> items
      .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
      // Paragraphs — lines not already wrapped
      .split("\n\n")
      .map((block) => {
        const trimmed = block.trim();
        if (!trimmed) return "";
        if (/^<(h[1-6]|ul|ol|li|blockquote|hr|pre)/.test(trimmed))
          return trimmed;
        return `<p>${trimmed.replace(/\n/g, " ")}</p>`;
      })
      .join("\n");

    return html;
  } catch {
    // If anything goes wrong, return plain text
    return `<p>${md}</p>`;
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = () => (
  <div className="animate-pulse max-w-3xl mx-auto px-4 py-12 space-y-6">
    <div className="h-4 bg-muted rounded w-24" />
    <div className="h-8 bg-muted rounded w-4/5" />
    <div className="h-8 bg-muted rounded w-3/5" />
    <div className="h-4 bg-muted rounded w-1/3" />
    <div className="h-64 bg-muted rounded-2xl" />
    <div className="space-y-3 pt-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className={`h-3 bg-muted rounded ${i % 3 === 2 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  </div>
);

// ─── Not found ────────────────────────────────────────────────────────────────

const NotFound = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 text-center px-4">
    <div className="p-5 rounded-full bg-primary/10">
      <BookOpen className="h-10 w-10 text-primary/50" />
    </div>
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Article not found
      </h1>
      <p className="text-muted-foreground">
        This post may have been moved or doesn't exist.
      </p>
    </div>
    <Link
      href="/blogs"
      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
    >
      <ArrowLeft className="h-4 w-4" /> Back to Blog
    </Link>
  </div>
);

// ─── Error state ──────────────────────────────────────────────────────────────

const ErrorState = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 text-center px-4">
    <div className="p-5 rounded-full bg-destructive/10">
      <AlertCircle className="h-10 w-10 text-destructive/50" />
    </div>
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Something went wrong
      </h1>
      <p className="text-muted-foreground">
        Failed to load the article. Please try again.
      </p>
    </div>
    <Link
      href="/blogs"
      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
    >
      <ArrowLeft className="h-4 w-4" /> Back to Blog
    </Link>
  </div>
);

// ─── Share button ─────────────────────────────────────────────────────────────

const ShareButton: React.FC<{ title?: string }> = ({ title }) => {
  const [copied, setCopied] = React.useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title ?? "",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled or clipboard unavailable — do nothing
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 transition-colors hover:bg-muted"
    >
      {copied ? (
        <>
          <Link2 className="h-3.5 w-3.5" /> Copied!
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5" /> Share
        </>
      )}
    </button>
  );
};

// ─── Single Blog Page ─────────────────────────────────────────────────────────

const SingleBlogPage: React.FC = () => {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";

  // Fetch all published blogs, find the one matching the slug
  const { data, isLoading, isError } = useQuery<BlogsResponse>({
    queryKey: ["/api/admin/blogs", { status: "published", slug }],
    queryFn: async () => {
      const res = await fetch(`/api/admin/blogs?status=published&limit=100`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!slug,
    staleTime: 60_000,
  });

  const blog: Blog | undefined = data?.blogs?.find((b) => b.slug === slug);

  if (isLoading) return <Skeleton />;
  if (isError) return <ErrorState />;
  if (!blog) return <NotFound />;

  const date = formatDate(blog.publishedAt || blog.createdAt);
  const mins = readTime(blog.content);
  const htmlContent = renderMarkdown(blog.content);
  const internalLinks = Array.isArray(blog.internalLinks)
    ? blog.internalLinks
    : [];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        {/* ── Schema markup injection ─────────────────────────────────────── */}
        {blog.schemaMarkup && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(blog.schemaMarkup),
            }}
          />
        )}

        {/* ── Top nav bar ─────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 h-16 border-b border-border bg-primary"></div>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All articles
          </Link>
        </div>

        <article className="max-w-3xl mx-auto px-4 py-12">
          {/* ── Header ──────────────────────────────────────────────────────── */}
          <header className="mb-10 space-y-5">
            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              {date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {date}
                </span>
              )}
              <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {mins} min read
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-foreground">
              {blog.title || "Untitled"}
            </h1>

            {/* Excerpt / lead */}
            {blog.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed border-l-2 border-primary pl-4">
                {blog.excerpt}
              </p>
            )}
          </header>

          {/* ── Featured image ───────────────────────────────────────────────── */}
          {blog.featuredImage && (
            <div className="mb-10 rounded-2xl overflow-hidden border border-border">
              <img
                src={blog.featuredImage}
                alt={blog.featuredImageAlt || blog.title || "Featured image"}
                className="w-full h-auto max-h-[480px] object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).parentElement?.remove();
                }}
              />
            </div>
          )}

          {/* ── Content ─────────────────────────────────────────────────────── */}
          {htmlContent ? (
            <div
              className="prose prose-neutral dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
              prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
              prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h2:mt-10
              prose-p:text-foreground/80 prose-p:leading-[1.85] prose-p:text-[15px]
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground
              prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none
              prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:not-italic prose-blockquote:text-muted-foreground
              prose-li:text-foreground/80 prose-li:text-[15px]
              prose-hr:border-border"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          ) : (
            <p className="text-muted-foreground italic">
              No content available.
            </p>
          )}

          {/* ── Internal links ───────────────────────────────────────────────── */}
          {internalLinks.length > 0 && (
            <aside className="mt-12 rounded-xl border border-border bg-card p-6 space-y-3">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Link2 className="h-4 w-4 text-primary" />
                Related Reading
              </p>
              <ul className="space-y-2">
                {internalLinks.map((link, i) => {
                  if (!link?.url) return null;
                  return (
                    <li key={i}>
                      <a
                        href={link.url}
                        target={
                          link.url.startsWith("http") ? "_blank" : undefined
                        }
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1.5"
                      >
                        <ArrowLeft className="h-3 w-3 rotate-180 flex-shrink-0" />
                        {link.label || link.url}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </aside>
          )}

          {/* ── Footer nav ──────────────────────────────────────────────────── */}
          <div className="mt-14 pt-8 border-t border-border flex items-center justify-between flex-wrap gap-4">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to all articles
            </Link>
            <ShareButton title={blog.title} />
          </div>
        </article>
      </div>
      <Footer />
    </>
  );
};

export default SingleBlogPage;
