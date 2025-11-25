import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Trash2, ShoppingCart, ExternalLink, Package, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Listing } from "@shared/schema";

interface SavedItemWithListing {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
  listing: Listing | null;
}

export default function UserSavedItems() {
  const { toast } = useToast();

  const { data: savedItems = [], isLoading } = useQuery<SavedItemWithListing[]>({
    queryKey: ['/api/saved-items'],
  });

  const removeMutation = useMutation({
    mutationFn: async (listingId: string) => {
      return apiRequest('DELETE', `/api/saved-items/${listingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items'] });
      toast({
        title: "Removed from saved items",
        description: "Item has been removed from your wishlist",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiRequest('POST', '/api/cart', {
        productId,
        quantity: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to cart!",
        description: "Item added to your shopping cart",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#8FC24C]" />
      </div>
    );
  }

  if (savedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Heart className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No Saved Items</h2>
        <p className="text-gray-500 mb-6 max-w-md">
          Items you save while browsing will appear here. Click the heart icon on any product to add it to your wishlist.
        </p>
        <Link href="/explore">
          <Button className="bg-[#8FC24C] hover:bg-[#7AB23C]" data-testid="button-explore-products">
            Explore Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700" data-testid="text-saved-items-title">
          {savedItems.length} Saved {savedItems.length === 1 ? 'Item' : 'Items'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedItems.map((item) => {
          const listing = item.listing;
          if (!listing) return null;

          const images = listing.images && listing.images.length > 0 
            ? listing.images 
            : [];

          return (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-saved-item-${item.id}`}>
              <div className="relative aspect-square bg-gray-100">
                {images.length > 0 ? (
                  <img
                    src={images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full"
                  onClick={() => removeMutation.mutate(listing.id)}
                  disabled={removeMutation.isPending}
                  data-testid={`button-remove-saved-${item.id}`}
                >
                  <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                </Button>

                {listing.status !== 'approved' && (
                  <Badge 
                    variant="secondary" 
                    className="absolute top-2 left-2"
                  >
                    {listing.status}
                  </Badge>
                )}
              </div>

              <CardContent className="p-4">
                <Link href={`/product/${listing.id}`}>
                  <h3 className="font-semibold text-gray-900 hover:text-[#8FC24C] transition-colors line-clamp-2 mb-2" data-testid={`text-saved-item-title-${item.id}`}>
                    {listing.title}
                  </h3>
                </Link>

                <div className="flex items-center gap-2 mb-3">
                  {listing.price && (
                    <span className="text-lg font-bold text-[#8FC24C]" data-testid={`text-saved-item-price-${item.id}`}>
                      HK${parseFloat(listing.price).toFixed(2)}
                    </span>
                  )}
                  {listing.tdEligible && listing.tdValue && (
                    <Badge variant="outline" className="text-xs">
                      {listing.tdValue} TD
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  {listing.type === 'product' && listing.status === 'approved' && (
                    <Button 
                      size="sm" 
                      className="flex-1 bg-[#8FC24C] hover:bg-[#7AB23C]"
                      onClick={() => addToCartMutation.mutate(listing.id)}
                      disabled={addToCartMutation.isPending}
                      data-testid={`button-add-cart-${item.id}`}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add to Cart
                    </Button>
                  )}
                  <Link href={`/product/${listing.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full" data-testid={`button-view-${item.id}`}>
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
