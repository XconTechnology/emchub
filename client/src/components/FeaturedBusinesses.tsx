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
    <section className="py-16 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured Businesses
          </h2>
          <p className="text-xl text-muted-foreground">
            Discover highly-rated ethnic minority businesses in Hong Kong
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {businesses.map((business) => (
            <Card key={business.id} className="bg-card rounded-2xl overflow-hidden shadow-lg hover-lift border-0">
              <div className="relative">
                <img
                  src={business.image}
                  alt={business.name}
                  className="w-full h-48 object-cover"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    {business.category}
                  </span>
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="ml-1 text-foreground font-medium">
                      {business.rating}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2" data-testid={`business-name-${business.id}`}>
                  {business.name}
                </h3>
                <p className="text-muted-foreground mb-4" data-testid={`business-description-${business.id}`}>
                  {business.description}
                </p>
                <div className="flex items-center text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span data-testid={`business-location-${business.id}`}>
                    {business.location}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors" data-testid="button-view-all-businesses">
            View All Businesses
          </Button>
        </div>
      </div>
    </section>
  );
}
