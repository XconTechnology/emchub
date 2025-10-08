import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import type { Category, Listing } from "@shared/schema";
import { Store } from "lucide-react";

export default function Explore() {
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: listings = [] } = useQuery<Listing[]>({
    queryKey: ['/api/listings'],
  });

  // Count published listings per category
  const categoryListingCounts = listings
    .filter(listing => listing.status === 'published' && !listing.deletedAt)
    .reduce((acc, listing) => {
      if (listing.categoryId) {
        acc[listing.categoryId] = (acc[listing.categoryId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

  // Define category colors using brand green variations
  const categoryColors = [
    "hsl(86 49% 53%)",
    "hsl(86 49% 45%)", 
    "hsl(86 49% 38%)",
    "hsl(86 60% 50%)",
    "hsl(86 40% 42%)",
    "hsl(86 55% 48%)",
    "hsl(86 45% 40%)",
    "hsl(86 50% 46%)",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header forceSolid={true} />
      
      <main className="pt-16">
        {/* Hero Section */}
        <div className="text-white relative overflow-hidden" style={{background: "linear-gradient(135deg, hsl(86 49% 53%) 0%, hsl(86 49% 45%) 50%, hsl(86 49% 38%) 100%)"}}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
            <h1 className="text-5xl md:text-6xl font-black mb-6 text-center">
              Explore Categories
            </h1>
            <p className="text-xl text-white/90 text-center max-w-3xl mx-auto">
              Discover ethnic minority businesses across Hong Kong by category
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 bg-gray-200 rounded mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">No categories available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => {
                const listingCount = categoryListingCounts[category.id] || 0;
                const color = categoryColors[index % categoryColors.length];
                
                return (
                  <Link key={category.id} href={`/category/${category.id}`}>
                    <Card 
                      className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-2 hover:border-primary/40"
                      data-testid={`category-card-${category.id}`}
                    >
                      <CardContent className="p-6">
                        {/* Icon/Visual */}
                        <div 
                          className="w-20 h-20 rounded-2xl mb-4 flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110"
                          style={{background: `linear-gradient(135deg, ${color}, ${color}dd)`}}
                        >
                          <Store className="w-10 h-10" />
                        </div>

                        {/* Category Name */}
                        <h3 
                          className="text-2xl font-black mb-2 group-hover:text-primary transition-colors"
                          data-testid={`category-name-${category.id}`}
                        >
                          {category.name}
                        </h3>

                        {/* Description */}
                        {category.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {category.description}
                          </p>
                        )}

                        {/* Listing Count Badge */}
                        <Badge 
                          variant="outline" 
                          className="text-sm"
                          style={{borderColor: color, color: color}}
                        >
                          {listingCount} {listingCount === 1 ? 'Business' : 'Businesses'}
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
