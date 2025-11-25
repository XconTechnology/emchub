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
  Coins
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
              const mainImage = images[0] || 'https://via.placeholder.com/300x300?text=No+Image';
              const categories = product.customCategory?.split(',').map(c => c.trim()).filter(Boolean) || [];
              const inStock = (product.inventory || 0) > 0;

              return (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <Card 
                    className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    data-testid={`card-product-${product.id}`}
                  >
                    <CardHeader className="p-0">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img
                          src={mainImage}
                          alt={product.title || 'Product'}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          data-testid={`img-product-${product.id}`}
                        />
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
                    
                    <CardContent className="p-4">
                      <h3 
                        className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#8FC24C] transition-colors"
                        data-testid={`text-product-title-${product.id}`}
                      >
                        {product.title}
                      </h3>
                      
                      {product.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                          {product.description}
                        </p>
                      )}

                      {categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
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
                      )}

                      <div className="space-y-2">
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
