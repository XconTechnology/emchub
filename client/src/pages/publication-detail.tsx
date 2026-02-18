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

          <div className="prose prose-lg max-w-none">
            {publication.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

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
    </div>
  );
}
