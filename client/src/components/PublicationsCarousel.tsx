import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import type { Publication } from "@shared/schema";

export default function PublicationsCarousel() {
  const { data: publications = [], isLoading } = useQuery<Publication[]>({
    queryKey: ['/api/publications'],
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [publications]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const cardWidth = 380;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -cardWidth : cardWidth,
      behavior: 'smooth',
    });
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse" />
              <div className="h-5 bg-gray-200 rounded w-96 animate-pulse" />
            </div>
          </div>
          <div className="flex gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[350px] animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-xl" />
                <div className="p-5 space-y-3 bg-white rounded-b-xl border border-t-0">
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

  if (publications.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-7 h-7 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">Publications</h2>
            </div>
            <p className="text-muted-foreground text-lg">
              Latest articles and guides from our community
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10"
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10"
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            <Link href="/publications">
              <Button variant="outline" className="gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {publications.map((pub) => (
            <Link key={pub.id} href={`/publications/${pub.slug}`}>
              <Card className="min-w-[320px] sm:min-w-[360px] max-w-[400px] overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group snap-start flex-shrink-0">
                {pub.featuredImage ? (
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={pub.featuredImage}
                      alt={pub.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-primary/30" />
                  </div>
                )}
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(pub.createdAt)}</span>
                    {pub.author && (
                      <>
                        <span className="text-muted-foreground/50">·</span>
                        <span>{pub.author}</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors leading-snug">
                    {pub.title.split('\n').map((line, idx) => (
                      <span key={idx}>
                        {idx > 0 && <br />}
                        {line}
                      </span>
                    ))}
                  </h3>
                  {pub.excerpt && (
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                      {pub.excerpt}
                    </p>
                  )}
                  {pub.tags && pub.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {pub.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs px-2 py-0.5">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
