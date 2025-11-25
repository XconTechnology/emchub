import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import type { Category, Listing } from "@shared/schema";
import { Store, Search, MapPin, X } from "lucide-react";

export default function Explore() {
  const [location, setLocation] = useLocation();
  
  // Parse URL search params
  const urlParams = new URLSearchParams(window.location.search);
  const initialSearch = urlParams.get("search") || "";
  const initialCategory = urlParams.get("category") || "all";
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isSearchMode, setIsSearchMode] = useState(!!initialSearch || (initialCategory && initialCategory !== "all"));

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: listings = [], isLoading: listingsLoading } = useQuery<Listing[]>({
    queryKey: ['/api/listings'],
  });

  // Update search mode when URL params change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get("search") || "";
    const category = params.get("category") || "all";
    setSearchTerm(search);
    setSelectedCategory(category);
    setIsSearchMode(!!search || (category && category !== "all"));
  }, [location]);

  // Filter listings based on search and category
  const filteredListings = listings.filter((listing) => {
    if (listing.status !== 'published' || listing.deletedAt) return false;
    
    const matchesSearch = !searchTerm || 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || selectedCategory === "all" || listing.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }
    if (selectedCategory && selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }
    const queryString = params.toString();
    setLocation(`/explore${queryString ? `?${queryString}` : ""}`);
    setIsSearchMode(!!searchTerm.trim() || (selectedCategory && selectedCategory !== "all"));
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setIsSearchMode(false);
    setLocation("/explore");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

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

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "Unknown";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header forceSolid={true} />
      
      <main className="pt-16">
        {/* Hero Section with Search */}
        <div className="text-white relative overflow-hidden" style={{background: "linear-gradient(135deg, hsl(86 49% 53%) 0%, hsl(86 49% 45%) 50%, hsl(86 49% 38%) 100%)"}}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-center">
              {isSearchMode ? "Search Results" : "Explore Categories"}
            </h1>
            <p className="text-lg text-white/90 text-center max-w-3xl mx-auto mb-8">
              {isSearchMode 
                ? `Found ${filteredListings.length} result${filteredListings.length !== 1 ? 's' : ''}`
                : "Discover ethnic minority businesses across Hong Kong"
              }
            </p>
            
            {/* Search Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-3">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Search businesses, cuisines, services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                      data-testid="explore-input-search"
                    />
                  </div>
                  <div className="relative min-w-[180px]">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl" data-testid="explore-select-category">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleSearch}
                    className="bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors" 
                    data-testid="explore-button-search"
                  >
                    Search
                  </Button>
                  {isSearchMode && (
                    <Button 
                      onClick={handleClearSearch}
                      variant="outline"
                      className="px-4 py-3 rounded-xl border-gray-300" 
                      data-testid="explore-button-clear"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {isSearchMode ? (
            /* Search Results */
            listingsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-40 bg-gray-200 rounded mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-2xl font-bold text-gray-600 mb-2">No results found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search terms or browse by category
                </p>
                <Button onClick={handleClearSearch} variant="outline">
                  Browse All Categories
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <Link key={listing.id} href={`/business/${listing.id}`}>
                    <Card 
                      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                      data-testid={`listing-card-${listing.id}`}
                    >
                      {/* Image */}
                      <div className="h-48 bg-gray-100 relative overflow-hidden">
                        {listing.images && listing.images.length > 0 ? (
                          <img 
                            src={listing.images[0]} 
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
                            <Store className="w-12 h-12 text-green-400" />
                          </div>
                        )}
                        <Badge className="absolute top-3 left-3 bg-white/90 text-gray-800">
                          {listing.type}
                        </Badge>
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
                          {listing.title}
                        </h3>
                        {listing.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {listing.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {listing.address && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span className="line-clamp-1">{listing.city || listing.address}</span>
                            </div>
                          )}
                        </div>
                        {listing.categoryId && (
                          <Badge variant="outline" className="mt-3 text-xs">
                            {getCategoryName(listing.categoryId)}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )
          ) : (
            /* Categories Grid */
            categoriesLoading ? (
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
                          <div 
                            className="w-20 h-20 rounded-2xl mb-4 flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110"
                            style={{background: `linear-gradient(135deg, ${color}, ${color}dd)`}}
                          >
                            <Store className="w-10 h-10" />
                          </div>
                          <h3 
                            className="text-2xl font-black mb-2 group-hover:text-primary transition-colors"
                            data-testid={`category-name-${category.id}`}
                          >
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {category.description}
                            </p>
                          )}
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
            )
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
