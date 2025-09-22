import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Store, MapPin, Phone, Mail, Globe, Edit, Trash2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import AddListingModal from "@/components/AddListingModal";
import EditListingModal from "@/components/EditListingModal";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import type { Listing } from "@shared/schema";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const [isAddListingModalOpen, setIsAddListingModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const { data: listings, isLoading: loadingListings } = useQuery<Listing[]>({
    queryKey: ['/api/me/listings'],
    enabled: !!user,
  });

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
              Please sign in to view your profile and manage your business listings.
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
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-gray-600 dark:text-gray-300" data-testid="profile-email">
                  {user?.email}
                </p>
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

      {/* Business Listings Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            My Business Listings
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your business listings and update your information
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
            {listings.map((listing: BusinessListing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg" data-testid={`listing-name-${listing.id}`}>
                        {listing.businessName}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {listing.category}
                        </Badge>
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedListing(listing);
                          setIsEditModalOpen(true);
                        }}
                        data-testid={`button-edit-${listing.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedListing(listing);
                          setIsDeleteDialogOpen(true);
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
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{listing.address}, {listing.city}</span>
                    </div>
                    
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

                  <div className="flex justify-between items-center pt-2">
                    <Badge 
                      variant={listing.isVerified === 'verified' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {listing.isVerified === 'verified' ? 'Verified' : 'Pending'}
                    </Badge>
                    {listing.priceRange && (
                      <span className="text-sm font-semibold text-primary">
                        {listing.priceRange}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <CardTitle className="mb-2">No Business Listings Yet</CardTitle>
              <CardDescription className="mb-4">
                Start building your business directory by adding your first listing
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

      {/* Edit Listing Modal */}
      <EditListingModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedListing(null);
        }}
        listing={selectedListing}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedListing(null);
        }}
        listing={selectedListing}
      />
    </div>
  );
}