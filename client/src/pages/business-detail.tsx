import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Star, 
  ArrowLeft, 
  Calendar, 
  DollarSign,
  Users,
  Package,
  CheckCircle
} from "lucide-react";
import type { Listing, Category } from "@shared/schema";

export default function BusinessDetail() {
  const { id } = useParams();

  const { data: listing, isLoading, error } = useQuery<Listing>({
    queryKey: ['/api/listings', id],
    queryFn: () => fetch(`/api/listings/${id}`).then(res => {
      if (!res.ok) throw new Error('Business not found');
      return res.json();
    }),
    enabled: !!id,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const category = categories?.find(c => c.id === listing?.categoryId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header forceSolid={true} />
        <div className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
              <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-xl mb-8"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background">
        <Header forceSolid={true} />
        <div className="pt-20 pb-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Business Not Found</h1>
            <p className="text-muted-foreground mb-6">The business you're looking for doesn't exist or has been removed.</p>
            <Link href="/directory">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Directory
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'N/A';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product': return <Package className="w-5 h-5" />;
      case 'service': return <Clock className="w-5 h-5" />;
      case 'event': return <Calendar className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header forceSolid={true} />
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/directory">
            <Button variant="outline" className="hover:bg-primary/10" data-testid="button-back-to-directory">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Directory
            </Button>
          </Link>
        </div>

        {/* Business Header */}
        <Card className="mb-8 bg-white/90 dark:bg-card/90 backdrop-blur-xl shadow-2xl border-2 border-primary/20">
          <CardContent className="p-0">
            {/* Image Gallery */}
            {listing.images && listing.images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                <div className="md:col-span-2">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-96 object-cover rounded-xl"
                    data-testid="business-main-image"
                  />
                </div>
                {listing.images.slice(1, 5).map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`${listing.title} - Image ${index + 2}`}
                      className="w-full h-48 object-cover rounded-xl"
                      data-testid={`business-image-${index + 1}`}
                    />
                    {index === 3 && listing.images!.length > 5 && (
                      <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                          +{listing.images!.length - 5} more
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-96 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center m-6 rounded-xl">
                <div className="text-center">
                  <div className="text-6xl mb-4">{category?.icon || '🏪'}</div>
                  <div className="text-primary font-bold text-xl">{category?.name || 'Business'}</div>
                </div>
              </div>
            )}

            <div className="p-6 pt-0">
              {/* Title and Status */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/20">
                      {getTypeIcon(listing.type)}
                      <span className="ml-2 capitalize">{listing.type}</span>
                    </Badge>
                    {category && (
                      <Badge variant="secondary">
                        {category.name}
                      </Badge>
                    )}
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approved
                    </Badge>
                  </div>
                  <h1 className="text-4xl font-black text-foreground mb-2" data-testid="business-title">
                    {listing.title}
                  </h1>
                </div>
                <div className="bg-white/90 dark:bg-card/90 backdrop-blur-md rounded-full px-4 py-3 flex items-center shadow-lg">
                  <Star className="w-5 h-5 text-yellow-500 fill-current mr-2" />
                  <span className="text-foreground font-bold">4.8</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed" data-testid="business-description">
                {listing.description}
              </p>

              {/* Tags */}
              {listing.tags && Array.isArray(listing.tags) && listing.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {listing.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <Card className="lg:col-span-2 bg-white/90 dark:bg-card/90 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {listing.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a href={`tel:${listing.phone}`} className="text-primary hover:underline" data-testid="business-phone">
                      {listing.phone}
                    </a>
                  </div>
                </div>
              )}

              {listing.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href={`mailto:${listing.email}`} className="text-primary hover:underline" data-testid="business-email">
                      {listing.email}
                    </a>
                  </div>
                </div>
              )}

              {listing.website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">Website</p>
                    <a 
                      href={listing.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary hover:underline"
                      data-testid="business-website"
                    >
                      Visit Website
                    </a>
                  </div>
                </div>
              )}

              {(listing.address || listing.city) && !listing.isOnlineOnly && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-muted-foreground" data-testid="business-address">
                      {listing.address && `${listing.address}, `}{listing.city}
                      {listing.postalCode && ` ${listing.postalCode}`}
                    </p>
                  </div>
                </div>
              )}

              {listing.isOnlineOnly && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-medium">Service Type</p>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      Online/Remote Service
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card className="bg-white/90 dark:bg-card/90 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Type-specific information */}
              {listing.type === 'product' && (
                <>
                  {listing.price && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Price</p>
                      <p className="text-lg font-bold text-primary">${listing.price}</p>
                    </div>
                  )}
                  {listing.inventory && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">In Stock</p>
                      <p className="font-semibold">{listing.inventory} items</p>
                    </div>
                  )}
                </>
              )}

              {listing.type === 'service' && (
                <>
                  {listing.duration && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Duration</p>
                      <p className="font-semibold">{listing.duration} minutes</p>
                    </div>
                  )}
                  {listing.price && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Starting Price</p>
                      <p className="text-lg font-bold text-primary">${listing.price}</p>
                    </div>
                  )}
                </>
              )}

              {listing.type === 'event' && (
                <>
                  {listing.eventDate && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Event Date</p>
                      <p className="font-semibold">{formatDate(listing.eventDate)}</p>
                    </div>
                  )}
                  {listing.capacity && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Capacity</p>
                      <p className="font-semibold">{listing.capacity} people</p>
                    </div>
                  )}
                  {listing.eventPrice && (
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Ticket Price</p>
                      <p className="text-lg font-bold text-primary">${listing.eventPrice}</p>
                    </div>
                  )}
                </>
              )}

              <Separator />

              <div>
                <p className="font-medium text-sm text-muted-foreground">Listed</p>
                <p className="text-sm">{formatDate(listing.createdAt)}</p>
              </div>

              {listing.moderatedAt && (
                <div>
                  <p className="font-medium text-sm text-muted-foreground">Approved</p>
                  <p className="text-sm">{formatDate(listing.moderatedAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Button className="flex-1 bg-primary hover:bg-primary/90" size="lg" data-testid="button-contact-business">
            <Phone className="w-5 h-5 mr-2" />
            Contact Business
          </Button>
          <Button variant="outline" size="lg" data-testid="button-share-business">
            Share
          </Button>
        </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}