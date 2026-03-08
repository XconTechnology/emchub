import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, Clock, ArrowRight, BookOpen, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  metaTitle?: string;
  status: string;
  publishedAt?: string;
  createdAt: string;
}

interface BlogsResponse {
  blogs: Blog[];
  page: number;
  limit: number;
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

function safeExcerpt(blog: Blog): string {
  if (blog.excerpt?.trim()) return blog.excerpt;
  if (blog.content?.trim()) {
    const plain = blog.content.replace(/[#*_>`\-\[\]]/g, "").trim();
    return plain.slice(0, 160) + (plain.length > 160 ? "…" : "");
  }
  return "Read the full article…";
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="animate-pulse rounded-2xl overflow-hidden border border-border bg-card">
    <div className="h-52 bg-muted" />
    <div className="p-6 space-y-3">
      <div className="h-3 bg-muted rounded w-1/3" />
      <div className="h-5 bg-muted rounded w-5/6" />
      <div className="h-5 bg-muted rounded w-4/6" />
      <div className="h-3 bg-muted rounded w-full" />
      <div className="h-3 bg-muted rounded w-3/4" />
    </div>
  </div>
);

// ─── Blog Card ────────────────────────────────────────────────────────────────

const BlogCard: React.FC<{ blog: Blog; featured?: boolean }> = ({
  blog,
  featured,
}) => {
  const date = formatDate(blog.publishedAt || blog.createdAt);
  const mins = readTime(blog.content);
  const excerpt = safeExcerpt(blog);

  return (
    <Link href={`/blog/${blog.slug ?? ""}`}>
      <article
        className={`group relative rounded-2xl overflow-hidden border border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer h-full flex flex-col ${
          featured ? "md:flex-row" : ""
        }`}
      >
        {/* Image */}
        <div
          className={`relative overflow-hidden bg-muted flex-shrink-0 ${
            featured ? "md:w-2/5 h-56 md:h-auto" : "h-52"
          }`}
        >
          {blog.featuredImage ? (
            <img
              src={blog.featuredImage}
              alt={blog.featuredImageAlt || blog.title || "Blog image"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/5">
              <BookOpen className="h-10 w-10 text-primary/20" />
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-6 gap-3">
          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {date && <span>{date}</span>}
            {date && (
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {mins} min read
            </span>
          </div>

          {/* Title */}
          <h2
            className={`font-bold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 ${
              featured ? "text-2xl" : "text-lg"
            }`}
          >
            {blog.title || "Untitled"}
          </h2>

          {/* Excerpt */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
            {excerpt}
          </p>

          {/* CTA */}
          <div className="flex items-center gap-1.5 text-sm font-medium text-primary mt-auto pt-2">
            Read article
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </article>
    </Link>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ filtered: boolean }> = ({ filtered }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-24 text-center gap-4">
    <div className="p-4 rounded-full bg-primary/10">
      <BookOpen className="h-8 w-8 text-primary/60" />
    </div>
    <div>
      <p className="font-semibold text-foreground">
        {filtered ? "No posts match your search" : "No posts yet"}
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        {filtered
          ? "Try different keywords"
          : "Check back soon for new content"}
      </p>
    </div>
  </div>
);

// ─── Error state ──────────────────────────────────────────────────────────────

const ErrorState = () => (
  <div className="col-span-full flex flex-col items-center justify-center py-24 text-center gap-4">
    <div className="p-4 rounded-full bg-destructive/10">
      <AlertCircle className="h-8 w-8 text-destructive/60" />
    </div>
    <div>
      <p className="font-semibold text-foreground">Failed to load posts</p>
      <p className="text-sm text-muted-foreground mt-1">
        Please try refreshing the page
      </p>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const BlogsPage: React.FC = () => {
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery<BlogsResponse>({
    queryKey: ["/api/admin/blogs", { status: "published", search }],
    queryFn: async () => {
      const params = new URLSearchParams({ status: "published" });
      if (search.trim()) params.append("search", search.trim());
      const res = await fetch(`/api/admin/blogs?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch blogs");
      return res.json();
    },
    staleTime: 60_000,
  });

  const blogs: Blog[] = data?.blogs ?? [];
  const [featured, ...rest] = blogs;

  return (
    <>
      <Header />

      <div className="min-h-screen bg-background">
        {/* ── Hero header ─────────────────────────────────────────────────── */}
        <div className="relative border-b border-border bg-primary overflow-hidden">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-white bg-primary/10 rounded-full px-3 py-1.5 mb-5">
              <BookOpen className="h-3 w-3" />
              Our Blog
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
              Insights & Articles
            </h1>
            <p className="text-white text-lg max-w-xl mx-auto mb-8">
              Thoughts, guides, and stories from our team.
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search articles…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="grid grid-cols-1">
              <ErrorState />
            </div>
          ) : blogs.length === 0 ? (
            <div className="grid grid-cols-1">
              <EmptyState filtered={!!search.trim()} />
            </div>
          ) : (
            <>
              {/* Featured post */}
              {featured && !search.trim() && (
                <section>
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
                    Featured
                  </p>
                  <BlogCard blog={featured} featured />
                </section>
              )}

              {/* Grid */}
              {(search.trim() ? blogs : rest).length > 0 && (
                <section>
                  {!search.trim() && rest.length > 0 && (
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                      Latest Posts
                    </p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(search.trim() ? blogs : rest).map((blog) => (
                      <BlogCard key={blog.id} blog={blog} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BlogsPage;
