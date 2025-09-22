import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Phone, Globe, Clock, Star } from 'lucide-react';
import { Listing, Category } from '@shared/schema';

export default function DirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [isOnlineOnly, setIsOnlineOnly] = useState<boolean | undefined>(undefined);

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Fetch listings with filters
  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ['/api/listings', { categories: selectedCategories, type: selectedType, search: searchTerm, isOnlineOnly }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategories.length > 0) {
        params.append('categories', selectedCategories.join(','));
      }
      if (selectedType) {
        params.append('type', selectedType);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (isOnlineOnly !== undefined) {
        params.append('isOnlineOnly', isOnlineOnly.toString());
      }
      
      const response = await fetch(`/api/listings?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      return response.json();
    },
  });

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(prev => prev === type ? '' : type);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedType('');
    setIsOnlineOnly(undefined);
  };

  const formatPrice = (price: string | null) => {
    if (!price) return null;
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const renderListingCard = (listing: Listing) => {
    const category = categories.find(cat => cat.id === listing.categoryId);
    
    return (
      <Card key={listing.id} className="hover:shadow-lg transition-shadow" data-testid={`card-listing-${listing.id}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg" data-testid={`text-title-${listing.id}`}>
                {listing.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Badge variant="secondary" data-testid={`badge-type-${listing.id}`}>
                  {listing.type}
                </Badge>
                {category && (
                  <Badge variant="outline" data-testid={`badge-category-${listing.id}`}>
                    {category.name}
                  </Badge>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-muted-foreground">4.5</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-3" data-testid={`text-description-${listing.id}`}>
            {listing.description}
          </p>
          
          <div className="space-y-2">
            {!listing.isOnlineOnly && listing.address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span data-testid={`text-address-${listing.id}`}>
                  {listing.address}, {listing.city}
                </span>
              </div>
            )}
            
            {listing.isOnlineOnly && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span data-testid={`text-online-${listing.id}`}>Online/Remote Service</span>
              </div>
            )}
            
            {listing.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span data-testid={`text-phone-${listing.id}`}>{listing.phone}</span>
              </div>
            )}
            
            {listing.price && (
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span data-testid={`text-price-${listing.id}`}>
                  {formatPrice(listing.price)}
                </span>
              </div>
            )}
            
            {listing.duration && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span data-testid={`text-duration-${listing.id}`}>
                  {listing.duration} minutes
                </span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button size="sm" data-testid={`button-view-${listing.id}`}>
              View Details
            </Button>
            {listing.type === 'service' && (
              <Button variant="outline" size="sm" data-testid={`button-book-${listing.id}`}>
                Book Now
              </Button>
            )}
            {listing.type === 'product' && (
              <Button variant="outline" size="sm" data-testid={`button-buy-${listing.id}`}>
                Buy Now
              </Button>
            )}
            {listing.type === 'event' && (
              <Button variant="outline" size="sm" data-testid={`button-register-${listing.id}`}>
                Register
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                Clear All
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search */}
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search listings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="text-sm font-medium mb-3 block">Type</label>
                <div className="space-y-2">
                  {['business', 'product', 'service', 'event'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={selectedType === type}
                        onCheckedChange={() => handleTypeChange(type)}
                        data-testid={`checkbox-type-${type}`}
                      />
                      <label
                        htmlFor={`type-${type}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                      >
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories Filter */}
              <div>
                <label className="text-sm font-medium mb-3 block">Categories</label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                        data-testid={`checkbox-category-${category.id}`}
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <label className="text-sm font-medium mb-3 block">Location</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="online-only"
                      checked={isOnlineOnly === true}
                      onCheckedChange={(checked) => setIsOnlineOnly(checked ? true : undefined)}
                      data-testid="checkbox-online-only"
                    />
                    <label
                      htmlFor="online-only"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Online/Remote Only
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="physical-location"
                      checked={isOnlineOnly === false}
                      onCheckedChange={(checked) => setIsOnlineOnly(checked ? false : undefined)}
                      data-testid="checkbox-physical-location"
                    />
                    <label
                      htmlFor="physical-location"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Physical Location
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2" data-testid="heading-directory">
              Business Directory
            </h1>
            <p className="text-muted-foreground">
              Discover the best places to stay, eat, shop & visit the city nearest to you.
            </p>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-muted rounded w-full mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground" data-testid="text-results-count">
                  {listings.length} listings found
                </p>
              </div>
              
              {listings.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="text-muted-foreground mb-4">
                      <Search className="h-12 w-12 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No listings found</h3>
                      <p>Try adjusting your filters or search terms to find what you're looking for.</p>
                    </div>
                    <Button onClick={clearFilters} data-testid="button-clear-all-filters">
                      Clear All Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                  {listings.map(renderListingCard)}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}