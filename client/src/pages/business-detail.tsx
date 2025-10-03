import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
  CheckCircle,
  MessageSquare,
  Flag
} from "lucide-react";
import type { Listing, Category } from "@shared/schema";

export default function BusinessDetail() {
  const { id } = useParams();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState<Array<{
    id: string;
    name: string;
    rating: number;
    text: string;
    date: string;
  }>>([]);

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

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewText.trim() || rating === 0) {
      return;
    }

    const newReview = {
      id: Date.now().toString(),
      name: reviewName,
      rating: rating,
      text: reviewText,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };

    setReviews([newReview, ...reviews]);
    setReviewName("");
    setReviewText("");
    setRating(0);
  };

  const StarRating = ({ value, onRate, readonly = false }: { value: number; onRate?: (rating: number) => void; readonly?: boolean }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onRate && onRate(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          >
            <Star
              className={`w-6 h-6 ${
                star <= (readonly ? value : (hoverRating || rating))
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header forceSolid={true} />
      <main className="pt-16">
        {/* Hero Section - Brand Green */}
        <div className="text-white relative overflow-hidden" style={{background: "linear-gradient(135deg, hsl(86 49% 53%) 0%, hsl(86 49% 45%) 50%, hsl(86 49% 38%) 100%)"}}>
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

            <div>
              {/* Business Info */}
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
                  <Button 
                    size="lg" 
                    className="bg-green-600 text-white hover:bg-green-700" 
                    onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                    data-testid="button-write-review"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Write a Review
                  </Button>
                  <Button 
                    size="lg" 
                    className="bg-green-600 text-white hover:bg-green-700" 
                    data-testid="button-report"
                  >
                    <Flag className="w-5 h-5 mr-2" />
                    Report
                  </Button>
                </div>
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

        {/* Reviews Section */}
        <div id="reviews-section" className="mt-12">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-primary" />
                Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Write a Review Form */}
              <div className="mb-8 p-6 bg-primary/5 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Name *</label>
                    <Input
                      type="text"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="Enter your name"
                      required
                      data-testid="input-review-name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Rating *</label>
                    <StarRating value={rating} onRate={setRating} />
                    {rating === 0 && (
                      <p className="text-sm text-muted-foreground mt-1">Click on stars to rate</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Your Review *</label>
                    <Textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience with this business..."
                      rows={4}
                      required
                      data-testid="textarea-review"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90"
                    data-testid="button-submit-review"
                  >
                    Submit Review
                  </Button>
                </form>
              </div>

              {/* Display Reviews */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No reviews yet. Be the first to review this business!</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <Card key={review.id} className="border-l-4 border-primary/30" data-testid={`review-${review.id}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-lg">{review.name}</h4>
                            <StarRating value={review.rating} readonly />
                          </div>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                        <p className="text-muted-foreground mt-3 leading-relaxed">{review.text}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}