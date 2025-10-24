import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  ShoppingCart, 
  Heart,
  Share2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Store,
  BadgeCheck,
  Package,
  Truck,
  Shield,
  DollarSign,
  Coins,
  MessageCircle
} from "lucide-react";
import type { Listing, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function ProductDetailPage() {
  const [, params] = useRoute("/product/:id");
  const productId = params?.id;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Check if user is logged in
  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/me'],
  });

  const { data: product, isLoading } = useQuery<Listing>({
    queryKey: [`/api/listings/${productId}`],
    enabled: !!productId,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/cart', {
        productId: product?.id,
        quantity,
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to cart!",
        description: `${quantity} ${quantity === 1 ? 'item' : 'items'} added to your cart`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  // Buy now mutation - adds to cart and navigates to cart page
  const buyNowMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/cart', {
        productId: product?.id,
        quantity,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      setLocation('/dashboard/cart');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    },
  });

  // Create or get conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async () => {
      if (!product) throw new Error("Product not found");
      
      return apiRequest('POST', '/api/conversations', {
        vendorId: product.userId,
        productId: product.id,
        productTitle: product.title,
      });
    },
    onSuccess: (data: any) => {
      setLocation(`/dashboard/messages`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
    },
  });

  const handleMessageVendor = () => {
    if (!currentUser) {
      // Save return URL and redirect to login
      const returnUrl = `/product/${productId}`;
      setLocation(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    // Don't allow messaging yourself
    if (currentUser.id === product?.userId) {
      toast({
        title: "Cannot message yourself",
        description: "You cannot send messages to your own products",
        variant: "destructive",
      });
      return;
    }

    createConversationMutation.mutate();
  };

  if (isLoading) {
    return (
      <>
        <Header forceSolid />
        <div className="min-h-screen flex items-center justify-center pt-16">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header forceSolid />
        <div className="min-h-screen flex items-center justify-center pt-16">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const images = product.images || [];
  const hasImages = images.length > 0;
  const categories = product.customCategory?.split(',').map(c => c.trim()).filter(Boolean) || [];

  const nextImage = () => {
    if (images.length === 0) return;
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length === 0) return;
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && (!product.inventory || newQuantity <= product.inventory)) {
      setQuantity(newQuantity);
    }
  };

  const inStock = !product.inventory || product.inventory > 0;
  const price = product.price ? parseFloat(product.price.toString()) : 0;

  return (
    <>
      <Header forceSolid />
      <div className="min-h-screen bg-gray-50 pt-16">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center text-sm text-gray-600">
              <Link href="/" className="hover:text-[#8FC24C]">Home</Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <Link href="/products" className="hover:text-[#8FC24C]">Products</Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-gray-900 truncate max-w-[200px]">{product.title}</span>
            </div>
          </div>
        </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-5">
            <div className="sticky top-4">
              <Card>
                <CardContent className="p-6">
                  {hasImages ? (
                    <div className="space-y-4">
                      {/* Main Image */}
                      <div className="relative bg-white rounded-lg overflow-hidden border" style={{ aspectRatio: '1/1' }}>
                        <img
                          src={images[selectedImageIndex]}
                          alt={product.title}
                          className="w-full h-full object-contain"
                          data-testid="product-main-image"
                        />
                        {images.length > 1 && (
                          <>
                            <button
                              onClick={prevImage}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition"
                              data-testid="button-prev-image"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              onClick={nextImage}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition"
                              data-testid="button-next-image"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                      
                      {/* Thumbnail Gallery */}
                      {images.length > 1 && (
                        <div className="grid grid-cols-6 gap-2">
                          {images.slice(0, 6).map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedImageIndex(idx)}
                              className={`border-2 rounded-lg overflow-hidden transition ${
                                selectedImageIndex === idx ? 'border-[#8FC24C]' : 'border-gray-200'
                              }`}
                              data-testid={`thumbnail-${idx}`}
                            >
                              <img src={img} alt={`${product.title} ${idx + 1}`} className="w-full h-16 object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center bg-gray-100 rounded-lg" style={{ aspectRatio: '1/1' }}>
                      <Package className="w-24 h-24 text-gray-300" />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" data-testid="button-share">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" data-testid="button-wishlist">
                      <Heart className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Middle Column - Product Details */}
          <div className="lg:col-span-4">
            <div className="space-y-4">
              {/* Title & Rating */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2" data-testid="product-title">
                  {product.title}
                </h1>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                    (45 reviews)
                  </span>
                </div>
              </div>

              <Separator />

              {/* Price */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900" data-testid="product-price">
                    ${price.toFixed(2)}
                  </span>
                  {product.inventory && (
                    <span className="text-sm text-gray-500">
                      ({product.inventory} in stock)
                    </span>
                  )}
                </div>
                {categories.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {categories.map((cat, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Payment Methods */}
              {product.paymentType && product.paymentType === "combo" && product.timedollarPercentage && product.timedollarPercentage > 0 && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                      <DollarSign className="w-5 h-5 text-[#8FC24C]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Combo Payment Available</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        This product uses a custom payment split: 
                        <span className="font-bold text-[#8FC24C]"> {product.timedollarPercentage}% TimeDollar + {product.cashPercentage}% Cash</span>
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        At checkout, you'll pay {product.timedollarPercentage}% of the price in TimeDollars and {product.cashPercentage}% in cash (1 TD = 60 HK$)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Stock Status */}
              <div className="space-y-2">
                {inStock ? (
                  <div className="flex items-center gap-2 text-green-700">
                    <Package className="w-5 h-5" />
                    <span className="font-semibold">In Stock</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <Package className="w-5 h-5" />
                    <span className="font-semibold">Out of Stock</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Truck className="w-5 h-5" />
                  <span className="text-sm">Free delivery available</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm">Secure transaction</span>
                </div>
              </div>

              <Separator />

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">About this item</h3>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Product Details */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Product Details</h3>
                  <div className="space-y-2 text-sm">
                    {product.type && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium capitalize">{product.type}</span>
                      </div>
                    )}
                    {product.inventory !== null && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stock:</span>
                        <span className="font-medium">{product.inventory} units</span>
                      </div>
                    )}
                    {product.status && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge variant="outline">{product.status}</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Buy Box */}
          <div className="lg:col-span-3">
            <div className="sticky top-4">
              <Card className="border-2">
                <CardContent className="p-6 space-y-4">
                  <div className="text-3xl font-bold text-gray-900">
                    ${price.toFixed(2)}
                  </div>

                  {inStock && (
                    <>
                      {/* Quantity Selector */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Quantity:
                        </label>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(-1)}
                            disabled={quantity <= 1}
                            data-testid="button-decrease-quantity"
                          >
                            -
                          </Button>
                          <span className="w-12 text-center font-medium" data-testid="text-quantity">
                            {quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(1)}
                            disabled={product.inventory !== null && quantity >= product.inventory}
                            data-testid="button-increase-quantity"
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      {/* Add to Cart */}
                      <Button 
                        className="w-full bg-[#8FC24C] hover:bg-[#7AB23C] text-white"
                        size="lg"
                        onClick={() => addToCartMutation.mutate()}
                        disabled={addToCartMutation.isPending}
                        data-testid="button-add-to-cart"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                      </Button>

                      <Button 
                        className="w-full"
                        variant="outline"
                        size="lg"
                        onClick={() => buyNowMutation.mutate()}
                        disabled={buyNowMutation.isPending}
                        data-testid="button-buy-now"
                      >
                        {buyNowMutation.isPending ? "Processing..." : "Buy Now"}
                      </Button>
                    </>
                  )}

                  {!inStock && (
                    <div className="text-center py-4">
                      <p className="text-red-600 font-semibold mb-3">Currently Unavailable</p>
                      <Button variant="outline" className="w-full" data-testid="button-notify">
                        Notify When Available
                      </Button>
                    </div>
                  )}

                  <Separator />

                  {/* Seller Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Store className="w-5 h-5" />
                      Sold by
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">EMC Vendor</span>
                        <BadgeCheck className="w-5 h-5 fill-blue-500 text-white" />
                      </div>
                      
                      {product.phone && (
                        <a href={`tel:${product.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#8FC24C]">
                          <Phone className="w-4 h-4" />
                          {product.phone}
                        </a>
                      )}
                      
                      {product.email && (
                        <a href={`mailto:${product.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#8FC24C]">
                          <Mail className="w-4 h-4" />
                          {product.email}
                        </a>
                      )}

                      {product.website && (
                        <a href={product.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#8FC24C]">
                          <Globe className="w-4 h-4" />
                          Visit Website
                        </a>
                      )}

                      {product.address && (
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{product.address}</span>
                        </div>
                      )}

                      <Button variant="outline" className="w-full mt-3" data-testid="button-contact-seller">
                        Contact Seller
                      </Button>

                      <Button 
                        variant="default" 
                        className="w-full mt-2 bg-[#8FC24C] hover:bg-[#7AB23C]" 
                        onClick={handleMessageVendor}
                        disabled={createConversationMutation.isPending}
                        data-testid="button-message-vendor"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {createConversationMutation.isPending ? "Starting..." : "Message Vendor"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold">4.5</div>
                  <div className="flex items-center gap-1 my-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">Based on 45 reviews</div>
                </div>
                <Separator orientation="vertical" className="h-24" />
                <div className="flex-1">
                  <Button data-testid="button-write-review">Write a Review</Button>
                </div>
              </div>
              <div className="text-center py-8 text-gray-500">
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
      
      <Footer />
    </>
  );
}
