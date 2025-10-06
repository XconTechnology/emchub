import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowLeft, Star } from "lucide-react";
import type { Listing, Category } from "@shared/schema";

export default function CategoryPage() {
  const { id } = useParams();

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: listings, isLoading } = useQuery<Listing[]>({
    queryKey: ['/api/listings', 'category', id],
    queryFn: () => fetch(`/api/listings?categoryId=${id}`).then(res => res.json()),
    enabled: !!id,
  });

  const category = categories?.find(c => c.id === id);

  // Helper function to truncate description to 10 words
  const truncateDescription = (text: string, wordLimit: number = 10) => {
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  if (isLoading || !categories) {
    return (
      <div className="min-h-screen bg-background">
        <Header forceSolid={true} />
        <div className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header forceSolid={true} />
        <div className="pt-20 pb-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Category Not Found</h1>
            <p className="text-muted-foreground mb-6">The category you're looking for doesn't exist.</p>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryListings = listings || [];

  return (
    <div className="min-h-screen bg-background">
      <Header forceSolid={true} />
      <main className="pt-16">
        {/* Colorful Hero Section */}
        <div className="text-white relative overflow-hidden" style={{background: "linear-gradient(135deg, hsl(86 49% 53%) 0%, hsl(86 49% 45%) 50%, hsl(86 49% 38%) 100%)"}}>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Back Button */}
            <Link href="/">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/20 mb-6"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>

            {/* Category Name */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4" data-testid="text-category-name">
                {category.name}
              </h1>
              <p className="text-lg md:text-xl text-green-50 max-w-3xl mx-auto opacity-90">
                {category.description}
              </p>
              <div className="mt-6">
                <span className="inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full text-white font-semibold">
                  {categoryListings.length} {categoryListings.length === 1 ? 'Listing' : 'Listings'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {categoryListings.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📭</div>
                <h2 className="text-2xl font-bold text-foreground mb-2">No Listings Yet</h2>
                <p className="text-muted-foreground">
                  There are no businesses in this category yet. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryListings.map((listing) => (
                  <Link key={listing.id} href={`/business/${listing.id}`}>
                    <Card 
                      className="h-full bg-white dark:bg-card hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 border-2 border-transparent hover:border-primary/40"
                      data-testid={`card-listing-${listing.id}`}
                    >
                      {/* Image */}
                      <div className="relative overflow-hidden">
                        {listing.images && listing.images.length > 0 ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                            data-testid={`img-listing-${listing.id}`}
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-4xl mb-2">🏪</div>
                              <div className="text-primary font-bold">{category.name}</div>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                        
                        {/* Rating Badge */}
                        <div className="absolute top-4 right-4 bg-white/90 dark:bg-card/90 backdrop-blur-md rounded-full px-3 py-2 flex items-center shadow-lg">
                          <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                          <span className="text-foreground font-bold text-sm">4.8</span>
                        </div>
                      </div>

                      <CardContent className="p-6 flex flex-col" style={{ height: '180px' }}>
                        {/* Title */}
                        <h3 
                          className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2"
                          data-testid={`text-listing-title-${listing.id}`}
                        >
                          {listing.title}
                        </h3>
                        
                        {/* Short Description - Max 10 words */}
                        <p 
                          className="text-muted-foreground mb-4 text-sm line-clamp-2 flex-grow"
                          data-testid={`text-listing-description-${listing.id}`}
                        >
                          {truncateDescription(listing.description || 'A wonderful local business serving the community.', 10)}
                        </p>
                        
                        {/* Location */}
                        {(listing.address || listing.city) && (
                          <div className="flex items-center text-muted-foreground text-sm mt-auto">
                            <MapPin className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                            <span className="truncate">
                              {listing.city || listing.address}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
