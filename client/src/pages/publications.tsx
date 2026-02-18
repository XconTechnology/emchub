import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, ArrowRight, BookOpen } from "lucide-react";
import type { Publication } from "@shared/schema";

export default function Publications() {
  const { data: publications = [], isLoading } = useQuery<Publication[]>({
    queryKey: ['/api/publications'],
  });

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header forceSolid={true} />
      <main className="pt-20 pb-16">
        <div className="bg-gradient-to-r from-[#2E7D32] to-[#8FC24C] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <BookOpen className="w-12 h-12 text-white mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-4">Publications</h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              Articles, guides, and stories celebrating Hong Kong's diverse ethnic minority communities
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : publications.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-muted-foreground mb-2">No Publications Yet</h2>
              <p className="text-muted-foreground">Check back soon for articles and community stories.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publications.map((pub) => (
                <Link key={pub.id} href={`/publications/${pub.slug}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
                    {pub.featuredImage && (
                      <div className="relative overflow-hidden h-52">
                        <img
                          src={pub.featuredImage}
                          alt={pub.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(pub.createdAt)}</span>
                        {pub.author && (
                          <>
                            <span>·</span>
                            <span>{pub.author}</span>
                          </>
                        )}
                      </div>
                      <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                        {pub.title.split('\n').map((line, idx) => (
                          <span key={idx}>
                            {idx > 0 && <br />}
                            {line}
                          </span>
                        ))}
                      </h2>
                      <p className="text-muted-foreground line-clamp-3 mb-4">
                        {pub.excerpt}
                      </p>
                      {pub.tags && pub.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {pub.tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
                        Read More <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
