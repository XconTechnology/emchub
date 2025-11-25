import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Search, 
  ShoppingCart, 
  BadgeCheck,
  Filter,
  Coins,
  ImageOff
} from "lucide-react";
import type { Listing } from "@shared/schema";

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products, isLoading } = useQuery<Listing[]>({
    queryKey: ['/api/listings'],
    select: (data) => data.filter(item => item.type === 'product' && item.status === 'published'),
  });

  // Filter products based on search
  const filteredProducts = products?.filter(product => {
    const searchLower = searchQuery.toLowerCase();
    return (
      product.title?.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower) ||
      product.customCategory?.toLowerCase().includes(searchLower)
    );
  }) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header forceSolid />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2" data-testid="text-page-title">
            Products Marketplace
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and purchase products from our verified vendors
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search products by name, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-products"
            />
          </div>
        </div>

        {/* Products Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400" data-testid="text-products-count">
            {isLoading ? "Loading products..." : `${filteredProducts.length} products found`}
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16" data-testid="empty-state">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? "No products found" : "No products available"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "Check back later for new products"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const images = product.images || [];
              const mainImage = images[0];
              const hasImage = mainImage && mainImage.trim() !== '';
              const categories = product.customCategory?.split(',').map(c => c.trim()).filter(Boolean) || [];
              const inStock = (product.inventory || 0) > 0;

              return (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <Card 
                    className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col"
                    data-testid={`card-product-${product.id}`}
                  >
                    <CardHeader className="p-0">
                      <div className="relative overflow-hidden rounded-t-lg">
                        {hasImage ? (
                          <div className="w-full h-48 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                            <img
                              src={mainImage}
                              alt={product.title || 'Product'}
                              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                              data-testid={`img-product-${product.id}`}
                            />
                          </div>
                        ) : (
                          <div 
                            className="w-full h-48 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center"
                            data-testid={`img-placeholder-${product.id}`}
                          >
                            <div className="w-16 h-16 mb-2 flex items-center justify-center">
                              <svg viewBox="0 0 100 100" className="w-full h-full text-gray-400">
                                <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="4"/>
                                <polygon points="30,70 45,50 55,60 75,35 75,70" fill="currentColor"/>
                                <circle cx="35" cy="35" r="8" fill="currentColor"/>
                              </svg>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">No image</p>
                            <p className="text-gray-400 dark:text-gray-500 text-xs">available</p>
                          </div>
                        )}
                        {!inStock && (
                          <Badge className="absolute top-2 right-2 bg-red-500">
                            Out of Stock
                          </Badge>
                        )}
                        {inStock && (product.inventory || 0) < 10 && (
                          <Badge className="absolute top-2 right-2 bg-orange-500">
                            Low Stock
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <h3 
                        className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#8FC24C] transition-colors"
                        data-testid={`text-product-title-${product.id}`}
                      >
                        {product.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 min-h-[2.5rem]">
                        {product.description || '\u00A0'}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-3 min-h-[1.5rem]">
                        {categories.slice(0, 2).map((cat, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                        {categories.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{categories.length - 2}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2 mt-auto">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-2xl font-bold text-[#8FC24C]" data-testid={`text-price-${product.id}`}>
                            ${product.price}
                          </p>
                          {product.tdEligible && product.tdValue && (
                            <Badge className="bg-brand-green text-white text-xs" data-testid={`badge-td-${product.id}`}>
                              <Coins className="w-3 h-3 mr-1" />
                              {product.tdValue} TD
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          {product.inventory !== null && (
                            <p className="text-xs text-gray-500">
                              {product.inventory} in stock
                            </p>
                          )}
                          {product.isVerified && (
                            <BadgeCheck 
                              className="w-5 h-5 fill-blue-500 text-white flex-shrink-0" 
                              data-testid={`badge-verified-${product.id}`}
                            />
                          )}
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 pt-0">
                      <Button 
                        className="w-full gap-2"
                        style={{ backgroundColor: '#8FC24C' }}
                        disabled={!inStock}
                        data-testid={`button-view-product-${product.id}`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {inStock ? "View Product" : "Out of Stock"}
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
