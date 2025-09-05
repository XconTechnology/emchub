import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star } from "lucide-react";

export default function FeaturedBusinesses() {
  const businesses = [
    {
      id: 1,
      name: "Karachi Delights",
      category: "Pakistani Cuisine",
      rating: 4.8,
      description: "Authentic Pakistani cuisine with traditional flavors and modern presentation",
      location: "Wan Chai, Hong Kong",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
    },
    {
      id: 2,
      name: "Mumbai Spice Bazaar",
      category: "Indian Grocery",
      rating: 4.9,
      description: "Premium Indian spices, ingredients, and traditional groceries imported directly from India",
      location: "Central, Hong Kong",
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
    },
    {
      id: 3,
      name: "Istanbul Gentleman's Cut",
      category: "Barber Services",
      rating: 4.7,
      description: "Traditional Turkish barbering techniques with modern styling for the contemporary gentleman",
      location: "Tsim Sha Tsui, Hong Kong",
      image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
    },
  ];

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
            Discover highly-rated ethnic minority businesses in Hong Kong that our community loves
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {businesses.map((business, index) => (
            <div key={business.id} className="group card-3d fade-in" style={{animationDelay: `${index * 0.1}s`}}>
              <Card className="card-inner bg-white/90 dark:bg-card/90 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl hover-lift border-2 border-primary/20 hover:border-primary/40 transition-all duration-500 relative">
                {/* Image Container */}
                <div className="relative overflow-hidden">
                  <img
                    src={business.image}
                    alt={business.name}
                    className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  
                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 dark:bg-card/90 backdrop-blur-md rounded-full px-3 py-2 flex items-center shadow-lg">
                    <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                    <span className="text-foreground font-bold text-sm">
                      {business.rating}
                    </span>
                  </div>
                </div>
                
                <CardContent className="p-8">
                  {/* Category Badge */}
                  <div className="mb-4">
                    <span className="inline-block bg-gradient-to-r from-primary/20 to-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold border border-primary/20">
                      {business.category}
                    </span>
                  </div>
                  
                  {/* Business Name */}
                  <h3 className="text-2xl font-black text-foreground mb-3 group-hover:text-primary transition-colors duration-300" data-testid={`business-name-${business.id}`}>
                    {business.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed" data-testid={`business-description-${business.id}`}>
                    {business.description}
                  </p>
                  
                  {/* Location */}
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-5 h-5 mr-3 text-primary" />
                    <span className="font-medium" data-testid={`business-location-${business.id}`}>
                      {business.location}
                    </span>
                  </div>
                </CardContent>
                
                {/* Hover Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
              </Card>
            </div>
          ))}
        </div>

        <div className="text-center mt-16 fade-in">
          <Button className="relative bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground px-12 py-6 rounded-3xl font-black text-lg shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:scale-105 pulse-ring overflow-hidden group" data-testid="button-view-all-businesses">
            <span className="relative z-10 flex items-center">
              View All Businesses
              <span className="ml-3 text-2xl group-hover:translate-x-2 transition-transform duration-300">→</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          </Button>
        </div>
      </div>
    </section>
  );
}
