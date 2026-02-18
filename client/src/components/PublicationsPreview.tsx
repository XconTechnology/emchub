import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, BookOpen, ArrowRight } from "lucide-react";
import type { Publication } from "@shared/schema";

export default function PublicationsPreview() {
  const { data: publications = [], isLoading } = useQuery<Publication[]>({
    queryKey: ['/api/publications'],
  });

  const latestPubs = publications.slice(0, 3);

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Publications</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-40 bg-gray-200 rounded-t-lg" />
                <div className="p-4 space-y-2 bg-white rounded-b-lg">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (latestPubs.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <BookOpen className="w-7 h-7 text-primary" />
            <h2 className="text-3xl font-bold">Publications</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Latest articles, stories, and insights from our community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestPubs.map(pub => (
            <Link key={pub.id} href={`/publications/${pub.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group">
                {pub.coverImage ? (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={pub.coverImage}
                      alt={pub.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-primary/40" />
                  </div>
                )}
                <CardContent className="p-4">
                  {pub.category && (
                    <Badge variant="outline" className="mb-2 text-xs text-primary border-primary/30">
                      {pub.category}
                    </Badge>
                  )}
                  <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {pub.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                    {pub.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> {pub.author}
                    </span>
                    {pub.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(pub.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/publications">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
              View All Publications <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
