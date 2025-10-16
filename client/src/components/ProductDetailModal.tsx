import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { 
  Star, 
  ShoppingCart, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Package, 
  Shield,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import type { Listing } from "@shared/schema";

interface ProductDetailModalProps {
  product: Listing | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product, isOpen]);

  if (!product) return null;

  const images = product.images || [];
  const hasImages = images.length > 0;

  const nextImage = () => {
    if (images.length === 0) return;
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length === 0) return;
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left Side - Image Gallery */}
          <div className="bg-gray-50 dark:bg-gray-900 p-6">
            {hasImages ? (
              <div className="space-y-4">
                <div className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden aspect-square">
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
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition"
                        data-testid="button-prev-image"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition"
                        data-testid="button-next-image"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
                
                {images.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                          selectedImageIndex === idx
                            ? "border-primary"
                            : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                        data-testid={`thumbnail-${idx}`}
                      >
                        <img
                          src={img}
                          alt={`${product.title} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg aspect-square flex items-center justify-center">
                <Package className="w-24 h-24 text-gray-300 dark:text-gray-600" />
              </div>
            )}
          </div>

          {/* Right Side - Product Details */}
          <div className="p-6 space-y-6">
            {/* Title and Categories */}
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="product-title">
                {product.title}
              </h2>
              
              {product.customCategory && (
                <div className="flex gap-2 flex-wrap">
                  {product.customCategory.split(',').filter(cat => cat.trim()).map((cat, index) => (
                    <Badge key={index} variant="outline" className="text-sm" data-testid={`category-badge-${index}`}>
                      {cat.trim()}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Rating placeholder - can be connected to real reviews */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">(0 reviews)</span>
              </div>
            </div>

            <Separator />

            {/* Price Section */}
            {product.price && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary" data-testid="product-price">
                    ${parseFloat(product.price.toString()).toFixed(2)}
                  </span>
                  {product.type === 'product' && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">/ unit</span>
                  )}
                </div>
              </div>
            )}

            {/* Stock Information */}
            {product.type === 'product' && product.inventory !== null && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Stock Available
                  </span>
                  <Badge variant="default" className="bg-green-600" data-testid="stock-badge">
                    {product.inventory} units
                  </Badge>
                </div>
              </div>
            )}

            {/* Payment Methods */}
            {product.paymentMethods && product.paymentMethods.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Methods</p>
                <div className="flex gap-2">
                  {product.paymentMethods.includes('cash') && (
                    <Badge variant="outline">Cash</Badge>
                  )}
                  {product.paymentMethods.includes('td') && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400">
                      TimeDollars
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <Separator />

            {/* Description */}
            {product.description && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Description</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed" data-testid="product-description">
                  {product.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Contact Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Seller Information</h3>
              
              {product.phone && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span data-testid="product-phone">{product.phone}</span>
                </div>
              )}
              
              {product.email && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span data-testid="product-email">{product.email}</span>
                </div>
              )}
              
              {product.website && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Globe className="w-4 h-4" />
                  <a 
                    href={product.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:underline"
                    data-testid="product-website"
                  >
                    {product.website}
                  </a>
                </div>
              )}

              {(product.address || product.city) && (
                <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mt-1" />
                  <span data-testid="product-location">
                    {[product.address, product.city].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button className="flex-1" size="lg" data-testid="button-contact-seller">
                <Phone className="w-5 h-5 mr-2" />
                Contact Seller
              </Button>
              <Button variant="outline" size="lg" className="flex-1" data-testid="button-add-to-cart">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            </div>

            {/* Trust Badge */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">Verified Seller</p>
                <p className="text-xs text-green-700 dark:text-green-300">This product is from a verified vendor</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
