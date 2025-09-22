import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Store, MapPin, Phone, Mail, Globe, Edit, Trash2, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import AddListingModal from "@/components/AddListingModal";
import type { Listing } from "@shared/schema";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const [isAddListingModalOpen, setIsAddListingModalOpen] = useState(false);

  const { data: listings, isLoading: loadingListings } = useQuery<Listing[]>({
    queryKey: ['/api/listings/user'],
    enabled: !!user,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'N/A';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Please sign in to view your profile and manage your listings.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.href = '/'}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="profile-name">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user?.username || 'User'}
                </h1>
                <p className="text-gray-600 dark:text-gray-300" data-testid="profile-email">
                  {user?.email}
                </p>
                {user?.isAdmin && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 mt-1">
                    Administrator
                  </Badge>
                )}
              </div>
            </div>
            <Button 
              onClick={() => setIsAddListingModalOpen(true)}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-add-new-listing"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Listing
            </Button>
          </div>
        </div>
      </div>

      {/* My Listings Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            My Listings
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your listings and track their approval status
          </p>
        </div>

        {loadingListings ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing: Listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow" data-testid={`my-listing-${listing.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg" data-testid={`listing-title-${listing.id}`}>
                        {listing.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(listing.moderationStatus)}
                        <Badge variant="outline" className="text-xs">
                          {listing.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          // TODO: Implement edit modal for new listing type
                        }}
                        data-testid={`button-edit-${listing.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          // TODO: Implement delete functionality
                        }}
                        data-testid={`button-delete-${listing.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {listing.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {listing.description}
                    </p>
                  )}
                  
                  <Separator />
                  
                  <div className="space-y-2 text-sm">
                    {listing.address && listing.city && (
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{listing.address}, {listing.city}</span>
                      </div>
                    )}
                    
                    {listing.isOnlineOnly && (
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>Online/Remote Service</span>
                      </div>
                    )}
                    
                    {listing.phone && (
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{listing.phone}</span>
                      </div>
                    )}
                    
                    {listing.email && (
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{listing.email}</span>
                      </div>
                    )}
                    
                    {listing.website && (
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
                        <a 
                          href={listing.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline truncate"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>

                  {listing.tags && Array.isArray(listing.tags) && listing.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {listing.tags.slice(0, 3).map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {listing.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{listing.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 text-xs text-gray-400">
                    <span>Created: {formatDate(listing.createdAt)}</span>
                    {listing.moderatedAt && (
                      <span>Reviewed: {formatDate(listing.moderatedAt)}</span>
                    )}
                  </div>

                  {listing.moderationStatus === 'rejected' && listing.moderationNotes && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                      <strong className="text-red-800">Rejection Reason:</strong>
                      <p className="text-red-700 mt-1">{listing.moderationNotes}</p>
                    </div>
                  )}

                  {listing.moderationStatus === 'pending' && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                      <p className="text-yellow-700">Your listing is under review. You'll be notified once it's approved.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <CardTitle className="mb-2">No Listings Yet</CardTitle>
              <CardDescription className="mb-4">
                Start building your presence by adding your first listing
              </CardDescription>
              <Button 
                onClick={() => setIsAddListingModalOpen(true)}
                className="bg-primary hover:bg-primary/90"
                data-testid="button-add-first-listing"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Listing
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Listing Modal */}
      <AddListingModal 
        isOpen={isAddListingModalOpen}
        onClose={() => setIsAddListingModalOpen(false)}
      />
    </div>
  );
}