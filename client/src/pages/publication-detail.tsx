import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, ArrowLeft, User, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Publication } from "@shared/schema";

export default function PublicationDetail() {
  const { slug } = useParams();

  const { data: publication, isLoading, error } = useQuery<Publication>({
    queryKey: [`/api/publications/${slug}`],
    enabled: !!slug,
  });

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header forceSolid={true} />
        <main className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-96 bg-gray-200 rounded-xl"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !publication) {
    return (
      <div className="min-h-screen bg-background">
        <Header forceSolid={true} />
        <main className="pt-20 pb-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Publication Not Found</h1>
            <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
            <Link href="/publications">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Publications
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header forceSolid={true} />
      <main className="pt-20 pb-16">
        {publication.featuredImage && (
          <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px]">
            <img
              src={publication.featuredImage}
              alt={publication.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                  {publication.title.split('\n').map((line, idx) => (
                    <span key={idx}>
                      {idx > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(publication.createdAt)}</span>
                  </div>
                  {publication.author && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{publication.author}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/publications">
            <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Publications
            </Button>
          </Link>

          {!publication.featuredImage && (
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              {publication.title.split('\n').map((line, idx) => (
                <span key={idx}>
                  {idx > 0 && <br />}
                  {line}
                </span>
              ))}
            </h1>
          )}

          {publication.tags && publication.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {publication.tags.map((tag, i) => (
                <Badge key={i} variant="outline" className="bg-primary/5 text-primary border-primary/20">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Card className="shadow-lg">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <div 
                className="prose prose-lg max-w-none
                  prose-headings:text-foreground prose-headings:font-bold
                  prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:pb-3 prose-h2:border-primary/20
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
                  prose-li:text-muted-foreground prose-li:leading-relaxed
                  prose-strong:text-foreground
                  prose-table:border-collapse prose-table:w-full
                  prose-th:bg-primary/10 prose-th:p-3 prose-th:text-left prose-th:font-semibold prose-th:border prose-th:border-border
                  prose-td:p-3 prose-td:border prose-td:border-border
                  prose-hr:border-primary/20 prose-hr:my-8
                  prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg"
                dangerouslySetInnerHTML={{ __html: publication.content }}
              />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
