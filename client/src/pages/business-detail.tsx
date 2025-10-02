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
      <main className="pt-16">
        {/* Hero Section - Brand Green */}
        <div className="bg-gradient-to-br from-primary via-emerald-500 to-green-600 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
            {/* Back Button */}
            <div className="mb-6">
              <Link href="/map">
                <Button variant="ghost" className="text-white hover:bg-white/20 border-white/30" data-testid="button-back-to-map">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Map
                </Button>
              </Link>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Left: Business Info */}
              <div>
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {listing.isOnlineOnly ? (
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      Online
                    </Badge>
                  ) : (
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      <MapPin className="w-3 h-3 mr-1" />
                      Physical Location
                    </Badge>
                  )}
                  {category && (
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      {category.name}
                    </Badge>
                  )}
                  <Badge className="bg-white text-green-600 font-semibold">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>

                {/* Business Title */}
                <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight" data-testid="business-title">
                  {listing.title}
                </h1>

                {/* Location */}
                {(listing.address || listing.city) && (
                  <div className="flex items-center gap-2 text-white/90 mb-6">
                    <MapPin className="w-5 h-5" />
                    <span className="text-lg" data-testid="business-location">
                      {listing.address || listing.city}
                    </span>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                  {listing.phone && (
                    <a href={`tel:${listing.phone}`}>
                      <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold" data-testid="button-call">
                        <Phone className="w-5 h-5 mr-2" />
                        Call Now
                      </Button>
                    </a>
                  )}
                  {listing.email && (
                    <a href={`mailto:${listing.email}`}>
                      <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" data-testid="button-email">
                        <Mail className="w-5 h-5 mr-2" />
                        Send Email
                      </Button>
                    </a>
                  )}
                  {listing.website && (
                    <a href={listing.website} target="_blank" rel="noopener noreferrer">
                      <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" data-testid="button-website">
                        <Globe className="w-5 h-5 mr-2" />
                        Visit Website
                      </Button>
                    </a>
                  )}
                </div>
              </div>

              {/* Right: Business Image or Icon */}
              <div className="lg:flex lg:justify-end">
                {listing.images && listing.images.length > 0 ? (
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 max-w-md w-full">
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-80 object-cover"
                      data-testid="business-hero-image"
                    />
                  </div>
                ) : (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 text-center max-w-md w-full border-2 border-white/20">
                    <div className="text-8xl mb-4">{category?.icon || '🏪'}</div>
                    <div className="text-2xl font-bold">{category?.name || 'Business'}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Description Card */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="business-description">
              {listing.description}
            </p>
            
            {/* Tags */}
            {listing.tags && Array.isArray(listing.tags) && listing.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {listing.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-sm bg-primary/5 text-primary border-primary/20">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {listing.phone && (
                  <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                    <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <a href={`tel:${listing.phone}`} className="text-lg font-semibold text-primary hover:underline" data-testid="business-phone">
                        {listing.phone}
                      </a>
                    </div>
                  </div>
                )}

                {listing.email && (
                  <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                    <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <a href={`mailto:${listing.email}`} className="text-lg font-semibold text-primary hover:underline break-all" data-testid="business-email">
                        {listing.email}
                      </a>
                    </div>
                  </div>
                )}

                {listing.website && (
                  <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                    <Globe className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Website</p>
                      <a 
                        href={listing.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-lg font-semibold text-primary hover:underline"
                        data-testid="business-website"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}

                {(listing.address || listing.city) && !listing.isOnlineOnly && (
                  <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Address</p>
                      <p className="text-lg font-semibold" data-testid="business-address">
                        {listing.address && `${listing.address}, `}{listing.city}
                        {listing.postalCode && ` ${listing.postalCode}`}
                      </p>
                    </div>
                  </div>
                )}

                {listing.isOnlineOnly && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <Globe className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Service Type</p>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 mt-1">
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

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <Card className="shadow-lg bg-gradient-to-br from-primary/5 to-emerald-50">
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                {category && (
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="text-muted-foreground">Category</span>
                    <Badge variant="outline">{category.name}</Badge>
                  </div>
                )}
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <span className="text-muted-foreground">Listed</span>
                  <span className="text-sm font-medium">{formatDate(listing.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}