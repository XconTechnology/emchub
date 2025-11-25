import { useState, useEffect } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
  MessageCircle,
  X
} from "lucide-react";
import type { Listing, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const SAVED_ITEMS_KEY = 'emchub_saved_items';

function getLocalSavedItems(): string[] {
  try {
    const saved = localStorage.getItem(SAVED_ITEMS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function setLocalSavedItems(items: string[]) {
  localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(items));
}

function addToLocalSaved(listingId: string) {
  const items = getLocalSavedItems();
  if (!items.includes(listingId)) {
    items.push(listingId);
    setLocalSavedItems(items);
  }
}

function removeFromLocalSaved(listingId: string) {
  const items = getLocalSavedItems();
  setLocalSavedItems(items.filter(id => id !== listingId));
}

function isLocalSaved(listingId: string): boolean {
  return getLocalSavedItems().includes(listingId);
}

export default function ProductDetailPage() {
  const [, params] = useRoute("/product/:id");
  const productId = params?.id;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isSaved, setIsSaved] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
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

  // Query to check if item is saved (only for logged-in users)
  const { data: savedStatus } = useQuery<{ isSaved: boolean }>({
    queryKey: ['/api/saved-items/check', productId],
    enabled: !!currentUser && !!productId,
  });

  // Query for product reviews
  interface ReviewWithUser {
    id: string;
    userId: string;
    listingId: string;
    vendorId: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user: {
      id: string;
      username: string;
      profileImageUrl: string | null;
    } | null;
  }

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<ReviewWithUser[]>({
    queryKey: ['/api/reviews/listing', productId],
    enabled: !!productId,
  });

  // Check if user has already reviewed
  const { data: reviewCheck } = useQuery<{ hasReviewed: boolean }>({
    queryKey: ['/api/reviews/check', productId],
    enabled: !!currentUser && !!productId,
  });

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/reviews', {
        listingId: productId,
        rating: reviewRating,
        comment: reviewText || null,
      });
    },
    onSuccess: () => {
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback",
      });
      setShowReviewForm(false);
      setReviewText("");
      setReviewRating(5);
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/listing', productId] });
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/check', productId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    },
  });

  // Effect to set isSaved state based on login status and saved data
  useEffect(() => {
    if (!productId) return;
    
    if (currentUser && savedStatus !== undefined) {
      // For logged-in users, use API response
      setIsSaved(savedStatus.isSaved);
    } else if (!currentUser) {
      // For guests, use localStorage
      setIsSaved(isLocalSaved(productId));
    }
  }, [currentUser, savedStatus, productId]);

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

  const handleAddToCart = () => {
    if (!currentUser) {
      // Save return URL and redirect to login
      const returnUrl = `/product/${productId}`;
      setLocation(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
      toast({
        title: "Login required",
        description: "Please sign in to add items to your cart",
      });
      return;
    }
    
    addToCartMutation.mutate();
  };

  const handleBuyNow = () => {
    if (!currentUser) {
      // Save return URL and redirect to login
      const returnUrl = `/product/${productId}`;
      setLocation(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
      toast({
        title: "Login required",
        description: "Please sign in to purchase items",
      });
      return;
    }
    
    buyNowMutation.mutate();
  };

  const handleMessageVendor = () => {
    if (!currentUser) {
      // Save return URL and redirect to login
      const returnUrl = `/product/${productId}`;
      setLocation(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
      toast({
        title: "Login required",
        description: "Please sign in to message vendors",
      });
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

  const handleShare = async () => {
    const productUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title || "Check out this product",
          text: product?.description || "I found this great product on EMC HUB!",
          url: productUrl,
        });
      } catch (error) {
        // User cancelled or share failed, fall back to clipboard
        copyToClipboard(productUrl);
      }
    } else {
      copyToClipboard(productUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Link copied!",
        description: "Product link has been copied to clipboard",
      });
    }).catch(() => {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually from the address bar",
        variant: "destructive",
      });
    });
  };

  // Mutations for save/unsave
  const saveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/saved-items', { listingId: productId });
    },
    onSuccess: () => {
      setIsSaved(true);
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items/check', productId] });
      toast({
        title: "Saved to wishlist!",
        description: "Item added to your saved items",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save item",
        variant: "destructive",
      });
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('DELETE', `/api/saved-items/${productId}`);
    },
    onSuccess: () => {
      setIsSaved(false);
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-items/check', productId] });
      toast({
        title: "Removed from wishlist",
        description: "Item removed from your saved items",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to unsave item",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!productId) return;
    
    if (currentUser) {
      // For logged-in users, use API
      if (isSaved) {
        unsaveMutation.mutate();
      } else {
        saveMutation.mutate();
      }
    } else {
      // For guests, use localStorage
      if (isSaved) {
        removeFromLocalSaved(productId);
        setIsSaved(false);
        toast({
          title: "Removed from wishlist",
          description: "Item removed from your saved items",
        });
      } else {
        addToLocalSaved(productId);
        setIsSaved(true);
        toast({
          title: "Saved to wishlist!",
          description: "Item added to your saved items. Sign in to access them from your dashboard.",
        });
      }
    }
  };

  const handleWriteReview = () => {
    if (!currentUser) {
      const returnUrl = `/product/${productId}`;
      setLocation(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
      toast({
        title: "Login required",
        description: "Please sign in to write a review",
      });
      return;
    }
    
    setShowReviewForm(true);
  };

  const handleSubmitReview = () => {
    submitReviewMutation.mutate();
  };

  const handleContactSeller = () => {
    if (!currentUser) {
      const returnUrl = `/product/${productId}`;
      setLocation(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
      toast({
        title: "Login required",
        description: "Please sign in to contact the seller",
      });
      return;
    }
    
    // Use the message vendor function
    handleMessageVendor();
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
                    <Button variant="outline" size="sm" className="flex-1" onClick={handleShare} data-testid="button-share">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`flex-1 ${isSaved ? 'bg-red-50 border-red-200 text-red-600' : ''}`}
                      onClick={handleSave} 
                      data-testid="button-wishlist"
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                      {isSaved ? 'Saved' : 'Save'}
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
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-gray-900" data-testid="product-price">
                    ${price.toFixed(2)}
                  </span>
                  {product.tdEligible && product.tdValue && (
                    <Badge className="bg-brand-green hover:bg-brand-green/90 text-white px-3 py-1" data-testid="badge-td-value">
                      <Coins className="w-4 h-4 mr-1" />
                      {product.tdValue} TD
                    </Badge>
                  )}
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
              
              {/* TD Eligible Info */}
              {product.tdEligible && product.tdValue && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                      <Coins className="w-5 h-5 text-brand-green" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">TimeDollar Eligible</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Earn <span className="font-bold text-brand-green">{product.tdValue} TD</span> when this order is delivered
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        You can also pay with TimeDollars if you have enough balance (1 TD = HK$60)
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                        onClick={handleAddToCart}
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
                        onClick={handleBuyNow}
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

                      <Button 
                        variant="outline" 
                        className="w-full mt-3" 
                        onClick={handleContactSeller}
                        data-testid="button-contact-seller"
                      >
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
              <h2 className="text-2xl font-bold mb-4" data-testid="text-reviews-title">Customer Reviews</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold" data-testid="text-average-rating">
                    {reviews.length > 0 ? averageRating.toFixed(1) : '0.0'}
                  </div>
                  <div className="flex items-center gap-1 my-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600" data-testid="text-review-count">
                    Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                  </div>
                </div>
                <Separator orientation="vertical" className="h-24" />
                <div className="flex-1">
                  {currentUser && reviewCheck?.hasReviewed ? (
                    <p className="text-sm text-gray-500">You have already reviewed this product</p>
                  ) : (
                    <Button onClick={handleWriteReview} data-testid="button-write-review">
                      Write a Review
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Review Form */}
              {showReviewForm && (
                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Write Your Review</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowReviewForm(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Rating */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star} 
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none"
                          data-testid={`rating-star-${star}`}
                        >
                          <Star 
                            className={`w-6 h-6 ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Review Text */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Your Review (optional)</label>
                    <Textarea
                      placeholder="Share your experience with this product..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={4}
                      className="w-full"
                      data-testid="textarea-review"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSubmitReview} 
                    className="bg-[#8FC24C] hover:bg-[#7AB23C]"
                    disabled={submitReviewMutation.isPending}
                    data-testid="button-submit-review"
                  >
                    {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              )}
              
              {/* Reviews List */}
              {reviewsLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Loading reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No reviews yet. Be the first to review this product!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0" data-testid={`review-item-${review.id}`}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          {review.user?.profileImageUrl ? (
                            <img 
                              src={review.user.profileImageUrl} 
                              alt={review.user.username} 
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-500 font-medium">
                              {review.user?.username?.charAt(0).toUpperCase() || '?'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium" data-testid={`review-username-${review.id}`}>
                                {review.user?.username || 'Anonymous'}
                              </span>
                              <div className="flex items-center gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500" data-testid={`review-date-${review.id}`}>
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="mt-2 text-gray-700" data-testid={`review-comment-${review.id}`}>
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
      
      <Footer />
    </>
  );
}
