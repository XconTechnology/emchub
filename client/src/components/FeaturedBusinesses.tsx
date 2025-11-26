import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, Phone, Mail, Globe } from "lucide-react";
import { normalizeImageUrl } from "@/lib/imageUtils";
import type { Listing, Category } from "@shared/schema";
import { Link } from "wouter";

export default function FeaturedBusinesses() {
  const { data: listings, isLoading } = useQuery<Listing[]>({
    queryKey: ['/api/listings'],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Group listings by category, show max 2 per category, max 6 total
  const groupedListings = listings ? 
    listings.reduce((groups: Record<string, Listing[]>, listing) => {
      if (!listing.categoryId) return groups;
      
      const category = categories?.find(c => c.id === listing.categoryId);
      const categoryName = category?.name || 'Other';
      
      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      
      if (groups[categoryName].length < 2) {
        groups[categoryName].push(listing);
      }
      
      return groups;
    }, {}) : {};

  // Get featured listings (max 3 total)
  const featuredListings = Object.values(groupedListings)
    .flat()
    .slice(0, 3);

  if (isLoading) {
    return (
      <section className="py-24 bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6">
              Featured Businesses
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-white/90 dark:bg-card/90 rounded-3xl overflow-hidden">
                <div className="w-full h-56 bg-gray-200 dark:bg-gray-700"></div>
                <CardContent className="p-8">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/3"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-2/3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!featuredListings.length) {
    return (
      <section className="py-24 bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6">
              Featured Businesses
            </h2>
            <p className="text-xl text-muted-foreground">
              No approved businesses yet. Check back soon!
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gradient-to-br from-background via-secondary/20 to-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/8 morphing-blob blur-3xl floating-element"></div>
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-primary/12 morphing-blob blur-2xl floating-element" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in">
          <div className="inline-block mb-4">
            <span className="inline-flex items-center px-6 py-2 bg-primary/15 text-primary font-semibold rounded-full text-sm uppercase tracking-wider">
              ⭐ Top Rated
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6 text-glow">
            Featured Businesses
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover approved ethnic minority businesses in Hong Kong that our community loves
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {featuredListings.map((listing, index) => {
            const category = categories?.find(c => c.id === listing.categoryId);
            
            return (
              <Link key={listing.id} href={`/business/${listing.id}`}>
                <div className="group card-3d fade-in cursor-pointer" style={{animationDelay: `${index * 0.1}s`}}>
                  <Card className="card-inner bg-white/90 dark:bg-card/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl hover-lift border-2 border-primary/20 hover:border-primary/40 transition-all duration-500 relative">
                  {/* Image Container */}
                  <div className="relative overflow-hidden">
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={normalizeImageUrl(listing.images[0])}
                        alt={listing.title}
                        className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-56 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-2">{category?.icon || '🏪'}</div>
                          <div className="text-primary font-bold">{category?.name || 'Business'}</div>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    
                    {/* Rating Badge - show a default rating for approved listings */}
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-card/90 backdrop-blur-md rounded-full px-3 py-2 flex items-center shadow-lg">
                      <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                      <span className="text-foreground font-bold text-sm">
                        4.8
                      </span>
                    </div>
                  </div>
                  
                  <CardContent className="p-8">
                    {/* Category Badge */}
                    <div className="mb-4">
                      <span className="inline-block bg-gradient-to-r from-primary/20 to-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold border border-primary/20">
                        {category?.name || 'Business'}
                      </span>
                    </div>
                    
                    {/* Business Name */}
                    <h3 className="text-2xl font-black text-foreground mb-3 group-hover:text-primary transition-colors duration-300" data-testid={`business-name-${listing.id}`}>
                      {listing.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed" data-testid={`business-description-${listing.id}`}>
                      {listing.description || 'A wonderful local business serving the community.'}
                    </p>
                    
                    {/* Location */}
                    {(listing.address || listing.city) && (
                      <div className="flex items-center text-muted-foreground mb-3">
                        <MapPin className="w-5 h-5 mr-3 text-primary flex-shrink-0" />
                        <span className="font-medium truncate" data-testid={`business-location-${listing.id}`}>
                          {listing.address ? `${listing.address}, ${listing.city}` : listing.city}
                        </span>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-2 text-sm">
                      {listing.phone && (
                        <div className="flex items-center text-muted-foreground">
                          <Phone className="w-4 h-4 mr-3 text-primary flex-shrink-0" />
                          <span className="truncate">{listing.phone}</span>
                        </div>
                      )}
                      
                      {listing.email && (
                        <div className="flex items-center text-muted-foreground">
                          <Mail className="w-4 h-4 mr-3 text-primary flex-shrink-0" />
                          <span className="truncate">{listing.email}</span>
                        </div>
                      )}
                      
                      {listing.website && (
                        <div className="flex items-center text-muted-foreground">
                          <Globe className="w-4 h-4 mr-3 text-primary flex-shrink-0" />
                          <span className="text-primary truncate">
                            Visit Website
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  {/* Hover Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
                  </Card>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-16 fade-in">
          <Link href="/map">
            <Button className="relative bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground px-12 py-6 rounded-3xl font-black text-lg shadow-2xl" data-testid="button-view-all-businesses">
              <span className="relative z-10 flex items-center">
                View All Businesses
                <span className="ml-3 text-2xl">→</span>
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}