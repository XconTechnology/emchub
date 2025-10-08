import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Listing } from "@shared/schema";

export default function UserBrowse() {
  const { data: listings, isLoading } = useQuery<Listing[]>({
    queryKey: ['/api/listings'],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
          Browse Listings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Discover businesses, services, and events
        </p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search for businesses, services..."
              className="pl-10"
              data-testid="input-search"
            />
          </div>
        </div>
        <Button data-testid="button-search">
          Search
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading listings...</p>
        </div>
      ) : !listings || listings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No listings available</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings
            .filter((listing) => listing.status === 'published' && !listing.deletedAt)
            .map((listing) => (
              <Link key={listing.id} href={`/business/${listing.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" data-testid={`card-listing-${listing.id}`}>
                  {listing.images && listing.images.length > 0 && (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{listing.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {listing.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {listing.address && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{listing.address}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
