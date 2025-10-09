import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, MapPin, Phone, Mail, Globe, Edit, Trash2, Plus, Clock, CheckCircle, XCircle, Package, Briefcase, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import AddListingModal from "@/components/AddListingModal";
import AddProductModal from "@/components/AddProductModal";
import AddServiceModal from "@/components/AddServiceModal";
import DashboardLayout from "@/components/DashboardLayout";
import type { Listing } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const [isAddListingModalOpen, setIsAddListingModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Listing | null>(null);
  const [itemToEdit, setItemToEdit] = useState<Listing | null>(null);
  const { toast } = useToast();

  const { data: listings, isLoading: loadingListings, refetch } = useQuery<Listing[]>({
    queryKey: ['/api/listings/user'],
    enabled: !!user,
    refetchInterval: 5000, // Poll every 5 seconds for real-time updates
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete listing');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings/user'] });
      toast({
        title: "Success!",
        description: "Listing deleted successfully",
      });
      setItemToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete listing",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
      case 'published':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Published</Badge>;
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

  const listingItems = listings?.filter(item => item.type === 'listing') || [];
  const productItems = listings?.filter(item => item.type === 'product') || [];
  const serviceItems = listings?.filter(item => item.type === 'service') || [];

  const renderItemCard = (item: Listing) => (
    <Card key={item.id} className="hover:shadow-lg transition-shadow" data-testid={`my-listing-${item.id}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg" data-testid={`listing-title-${item.id}`}>
              {item.title}
            </CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              {getStatusBadge(item.status || item.moderationStatus)}
              <Badge variant="outline" className="text-xs capitalize">
                {item.type}
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setItemToEdit(item);
                if (item.type === 'listing') setIsAddListingModalOpen(true);
                else if (item.type === 'product') setIsAddProductModalOpen(true);
                else if (item.type === 'service') setIsAddServiceModalOpen(true);
              }}
              data-testid={`button-edit-${item.id}`}
              disabled={item.status === 'pending'}
              title={item.status === 'pending' ? 'Cannot edit while pending review' : 'Edit listing'}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setItemToDelete(item)}
              data-testid={`button-delete-${item.id}`}
              disabled={item.status === 'pending'}
              title={item.status === 'pending' ? 'Cannot delete while pending review' : 'Delete listing'}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {item.images && item.images.length > 0 && (
          <img src={item.images[0]} alt={item.title} className="w-full h-40 object-cover rounded-lg" />
        )}

        {item.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {item.description}
          </p>
        )}

        {item.type === 'product' && (
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-lg text-primary">${item.price}</span>
            <span className="text-gray-500">Stock: {item.inventory || 0}</span>
          </div>
        )}

        {item.type === 'service' && item.price && (
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg text-primary">${item.price}</span>
              {item.duration && (
                <span className="text-sm text-gray-500">{item.duration} mins</span>
              )}
            </div>
          </div>
        )}
        
        <Separator />
        
        <div className="space-y-2 text-sm">
          {item.address && item.city && (
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{item.address}, {item.city}</span>
            </div>
          )}
          
          {item.isOnlineOnly && (
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>Online/Remote Service</span>
            </div>
          )}
          
          {item.phone && (
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{item.phone}</span>
            </div>
          )}
          
          {item.email && (
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{item.email}</span>
            </div>
          )}
          
          {item.website && (
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
              <a 
                href={item.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
              >
                Visit Website
              </a>
            </div>
          )}
        </div>

        {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {item.tags.slice(0, 3).map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{item.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex justify-between items-center pt-2 text-xs text-gray-400">
          <span>Created: {formatDate(item.createdAt)}</span>
          {item.moderatedAt && (
            <span>Reviewed: {formatDate(item.moderatedAt)}</span>
          )}
        </div>

        {item.status === 'rejected' && item.moderationNotes && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
            <strong className="text-red-800">Rejection Reason:</strong>
            <p className="text-red-700 mt-1">{item.moderationNotes}</p>
          </div>
        )}

        {item.status === 'pending' && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <p className="text-yellow-700">Your listing is under review. You'll be notified once it's approved.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderEmptyState = (type: string, icon: React.ReactNode, onAdd: () => void) => (
    <Card className="text-center py-12">
      <CardContent>
        <div className="text-gray-300 mb-4 flex justify-center">
          {icon}
        </div>
        <CardTitle className="mb-2">No {type}s Yet</CardTitle>
        <CardDescription className="mb-4">
          Start by adding your first {type.toLowerCase()}
        </CardDescription>
        <Button 
          onClick={onAdd}
          className="bg-primary hover:bg-primary/90"
          data-testid={`button-add-first-${type.toLowerCase()}`}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Your First {type}
        </Button>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Card className="w-full max-w-md wp-card">
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
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <Card className="wp-card mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
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
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="profile-name">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.username || 'User'}
                  </h2>
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
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={() => setIsAddListingModalOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                  data-testid="button-add-listing"
                >
                  <Store className="w-4 h-4 mr-2" />
                  Add Listing
                </Button>
                <Button 
                  onClick={() => setIsAddProductModalOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                  data-testid="button-add-product"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
                <Button 
                  onClick={() => setIsAddServiceModalOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                  data-testid="button-add-service"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Listings, Products, Services */}
        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
            <TabsTrigger value="listings" data-testid="tab-listings">
              Listings ({listingItems.length})
            </TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">
              Products ({productItems.length})
            </TabsTrigger>
            <TabsTrigger value="services" data-testid="tab-services">
              Services ({serviceItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                My Listings
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your business listings
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
            ) : listingItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listingItems.map(renderItemCard)}
              </div>
            ) : (
              renderEmptyState('Listing', <Store className="w-16 h-16" />, () => setIsAddListingModalOpen(true))
            )}
          </TabsContent>

          <TabsContent value="products">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                My Products
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your product catalog
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
            ) : productItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productItems.map(renderItemCard)}
              </div>
            ) : (
              renderEmptyState('Product', <Package className="w-16 h-16" />, () => setIsAddProductModalOpen(true))
            )}
          </TabsContent>

          <TabsContent value="services">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                My Services
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your service offerings
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
            ) : serviceItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {serviceItems.map(renderItemCard)}
              </div>
            ) : (
              renderEmptyState('Service', <Briefcase className="w-16 h-16" />, () => setIsAddServiceModalOpen(true))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Modals */}
      <AddListingModal 
        isOpen={isAddListingModalOpen}
        onClose={() => {
          setIsAddListingModalOpen(false);
          setItemToEdit(null);
        }}
        editListing={itemToEdit?.type === 'listing' ? itemToEdit : undefined}
      />
      <AddProductModal 
        isOpen={isAddProductModalOpen}
        onClose={() => {
          setIsAddProductModalOpen(false);
          setItemToEdit(null);
        }}
        editProduct={itemToEdit?.type === 'product' ? itemToEdit : undefined}
      />
      <AddServiceModal 
        isOpen={isAddServiceModalOpen}
        onClose={() => {
          setIsAddServiceModalOpen(false);
          setItemToEdit(null);
        }}
        editService={itemToEdit?.type === 'service' ? itemToEdit : undefined}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {itemToDelete?.type}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && deleteMutation.mutate(itemToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
