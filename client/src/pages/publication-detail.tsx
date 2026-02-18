import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, BookOpen } from "lucide-react";
import type { Publication } from "@shared/schema";

export default function PublicationDetailPage() {
  const { slug } = useParams();

  const { data: publication, isLoading, error } = useQuery<Publication>({
    queryKey: ['/api/publications', slug],
    queryFn: () => fetch(`/api/publications/${slug}`).then(res => {
      if (!res.ok) throw new Error('Publication not found');
      return res.json();
    }),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header forceSolid={true} />
        <div className="pt-20 pb-16 max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-12 bg-gray-200 rounded w-3/4" />
            <div className="h-64 bg-gray-200 rounded" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="min-h-screen bg-background">
        <Header forceSolid={true} />
        <div className="pt-20 pb-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h1 className="text-2xl font-bold mb-4">Publication Not Found</h1>
            <Link href="/publications">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Publications
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isHtmlContent = publication.content.includes('<') && publication.content.includes('>');

  return (
    <div className="min-h-screen bg-background">
      <Header forceSolid={true} />
      <main className="pt-20 pb-16">
        {publication.coverImage && (
          <div className="w-full h-64 md:h-96 overflow-hidden">
            <img
              src={publication.coverImage}
              alt={publication.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/publications">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Publications
            </Button>
          </Link>

          {publication.category && (
            <Badge variant="outline" className="mb-3 text-primary border-primary/30">
              {publication.category}
            </Badge>
          )}

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{publication.title}</h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" /> {publication.author}
            </span>
            {publication.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(publication.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>

          {isHtmlContent ? (
            <div
              className="publication-content"
              dangerouslySetInnerHTML={{ __html: publication.content }}
            />
          ) : (
            <div className="prose prose-lg max-w-none">
              {publication.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-foreground leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {publication.tags && publication.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t">
              {publication.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      <style>{`
        .publication-content {
          color: var(--foreground, #1a1a1a);
          line-height: 1.8;
          font-size: 1rem;
        }
        @media (min-width: 768px) {
          .publication-content {
            font-size: 1.125rem;
          }
        }
        .publication-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          color: var(--foreground, #1a1a1a);
          padding-bottom: 0.5rem;
          border-bottom: 2px solid hsl(var(--primary) / 0.2);
        }
        @media (min-width: 768px) {
          .publication-content h2 {
            font-size: 1.75rem;
          }
        }
        .publication-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          color: var(--foreground, #1a1a1a);
        }
        @media (min-width: 768px) {
          .publication-content h3 {
            font-size: 1.375rem;
          }
        }
        .publication-content p {
          margin-bottom: 1rem;
          line-height: 1.8;
        }
        .publication-content .bilingual-text {
          color: hsl(var(--muted-foreground));
          font-size: 0.9375rem;
          line-height: 1.7;
          margin-top: -0.5rem;
          margin-bottom: 1.25rem;
        }
        @media (min-width: 768px) {
          .publication-content .bilingual-text {
            font-size: 1rem;
          }
        }
        .publication-content ul {
          list-style: none;
          padding-left: 0;
          margin-bottom: 1.25rem;
        }
        .publication-content ul li {
          position: relative;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.7;
        }
        .publication-content ul li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: hsl(var(--primary));
          font-weight: bold;
          font-size: 1.2em;
        }
        .publication-content ol {
          counter-reset: item;
          list-style: none;
          padding-left: 0;
          margin-bottom: 1.25rem;
        }
        .publication-content ol > li {
          counter-increment: item;
          position: relative;
          padding-left: 2rem;
          margin-bottom: 1rem;
        }
        .publication-content ol > li::before {
          content: counter(item) ".";
          position: absolute;
          left: 0;
          color: hsl(var(--primary));
          font-weight: 700;
        }
        .publication-content .section-card {
          background: hsl(var(--muted) / 0.3);
          border-radius: 0.75rem;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          border: 1px solid hsl(var(--border));
        }
        @media (min-width: 768px) {
          .publication-content .section-card {
            padding: 1.5rem 2rem;
          }
        }
        .publication-content .phrase-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          font-size: 0.875rem;
          border-radius: 0.5rem;
          overflow: hidden;
          border: 1px solid hsl(var(--border));
        }
        @media (min-width: 768px) {
          .publication-content .phrase-table {
            font-size: 1rem;
          }
        }
        .publication-content .phrase-table th {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.8125rem;
        }
        @media (min-width: 768px) {
          .publication-content .phrase-table th {
            padding: 0.75rem 1rem;
            font-size: 0.9375rem;
          }
        }
        .publication-content .phrase-table td {
          padding: 0.625rem 0.75rem;
          border-bottom: 1px solid hsl(var(--border));
          vertical-align: top;
        }
        @media (min-width: 768px) {
          .publication-content .phrase-table td {
            padding: 0.75rem 1rem;
          }
        }
        .publication-content .phrase-table tr:nth-child(even) {
          background: hsl(var(--muted) / 0.3);
        }
        .publication-content .phrase-table tr:last-child td {
          border-bottom: none;
        }
        .publication-content .highlight-box {
          background: hsl(var(--primary) / 0.05);
          border-left: 4px solid hsl(var(--primary));
          padding: 1rem 1.25rem;
          margin: 1.25rem 0;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        .publication-content .section-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border-radius: 50%;
          font-weight: 700;
          font-size: 0.875rem;
          margin-right: 0.75rem;
          flex-shrink: 0;
        }
        .publication-content .section-header {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
        }
        .publication-content img,
        .publication-content .article-image {
          width: 100%;
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 1.5rem 0;
        }
        .publication-content strong {
          color: var(--foreground, #1a1a1a);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
