import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingBag, Star, DollarSign, Briefcase, Plus, Store, Package, Edit, Trash2, MapPin, Calendar, Warehouse, Ticket, Receipt } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Listing } from "@shared/schema";
import AddListingModal from "@/components/AddListingModal";
import AddProductModal from "@/components/AddProductModal";
import AddServiceModal from "@/components/AddServiceModal";

export default function UserDashboardHome() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isAddListingModalOpen, setIsAddListingModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  const { data: userListings, isLoading } = useQuery<Listing[]>({
    queryKey: ['/api/listings/user'],
    enabled: !!user,
  });

  const { data: timeDollarData } = useQuery<{ balance: number }>({
    queryKey: ['/api/timedollars/balance'],
    enabled: !!user,
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/listings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings/user'] });
      toast({ title: "Item deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete item", variant: "destructive" });
    },
  });

  const listings = userListings?.filter(item => item.type === 'business') || [];
  const products = userListings?.filter(item => item.type === 'product') || [];
  const services = userListings?.filter(item => item.type === 'service') || [];

  // Count only approved (published) items for stats
  const approvedListings = listings.filter(item => item.status === 'published');
  const approvedProducts = products.filter(item => item.status === 'published');
  const approvedServices = services.filter(item => item.status === 'published');

  const stats = [
    {
      title: "Total Listings",
      value: approvedListings.length.toString(),
      description: "Approved business listings",
      icon: Store,
      color: "text-blue-500",
    },
    {
      title: "Products",
      value: approvedProducts.length.toString(),
      description: "Approved products",
      icon: Package,
      color: "text-green-500",
    },
    {
      title: "Services",
      value: approvedServices.length.toString(),
      description: "Approved services",
      icon: Briefcase,
      color: "text-purple-500",
    },
    {
      title: "TimeDollars Balance",
      value: timeDollarData?.balance?.toString() || "0",
      description: "Available to spend",
      icon: DollarSign,
      color: "text-yellow-500",
    },
  ];

  const renderItemCard = (item: Listing) => (
    <Card key={item.id} className="hover:shadow-lg transition-shadow">
      {item.images && item.images.length > 0 && (
        <img src={item.images[0]} alt={item.title} className="w-full h-48 object-cover rounded-t-lg" />
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{item.title}</CardTitle>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                {item.status}
              </Badge>
              {item.type === 'product' && item.price && (
                <Badge variant="outline">${parseFloat(item.price.toString()).toFixed(2)}</Badge>
              )}
              {item.customCategory && item.customCategory.split(',').filter(cat => cat.trim()).map((cat, index) => (
                <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {cat.trim()}
                </Badge>
              ))}
              {item.type === 'service' && item.paymentMethods?.includes('td') && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  TimeDollars
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" data-testid={`button-edit-${item.id}`}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => deleteItemMutation.mutate(item.id)}
              data-testid={`button-delete-${item.id}`}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {item.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{item.description}</p>
        )}
        {item.address && (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="truncate">{item.address}</span>
          </div>
        )}
        {item.type === 'product' && item.inventory !== null && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Stock: {item.inventory} units
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-page-title">
          Welcome, {user?.username}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your listings, products, and services
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Items</CardTitle>
          <CardDescription>Choose what you want to add to your marketplace</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              onClick={() => setIsAddListingModalOpen(true)}
              className="h-auto py-6 flex flex-col items-center gap-2"
              variant="outline"
              data-testid="button-add-listing"
            >
              <Store className="w-8 h-8" />
              <div className="text-center">
                <div className="font-semibold">Add Listing</div>
                <div className="text-xs text-gray-500">Business or location</div>
              </div>
            </Button>
            <Button
              onClick={() => setIsAddProductModalOpen(true)}
              className="h-auto py-6 flex flex-col items-center gap-2"
              variant="outline"
              data-testid="button-add-product"
            >
              <Package className="w-8 h-8" />
              <div className="text-center">
                <div className="font-semibold">Add Product</div>
                <div className="text-xs text-gray-500">Item for sale</div>
              </div>
            </Button>
            <Button
              onClick={() => setIsAddServiceModalOpen(true)}
              className="h-auto py-6 flex flex-col items-center gap-2"
              variant="outline"
              data-testid="button-add-service"
            >
              <Briefcase className="w-8 h-8" />
              <div className="text-center">
                <div className="font-semibold">Add Service</div>
                <div className="text-xs text-gray-500">Service you offer</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Your Business</CardTitle>
          <CardDescription>Access all your business management tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            <Button
              onClick={() => setLocation("/dashboard/my-listings")}
              className="h-auto py-6 flex flex-col items-center gap-2"
              variant="outline"
              data-testid="card-my-listings"
            >
              <Store className="w-8 h-8 text-blue-500" />
              <div className="text-center">
                <div className="font-semibold">My Listings</div>
                <div className="text-xs text-gray-500">{approvedListings.length} approved</div>
              </div>
            </Button>
            
            {user?.vendorStatus === 'verified' && (
              <>
                <Button
                  onClick={() => setLocation("/dashboard/products")}
                  className="h-auto py-6 flex flex-col items-center gap-2"
                  variant="outline"
                  data-testid="card-my-products"
                >
                  <Package className="w-8 h-8 text-green-500" />
                  <div className="text-center">
                    <div className="font-semibold">My Products</div>
                    <div className="text-xs text-gray-500">{approvedProducts.length} approved</div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => setLocation("/dashboard/my-services")}
                  className="h-auto py-6 flex flex-col items-center gap-2"
                  variant="outline"
                  data-testid="card-my-services"
                >
                  <Briefcase className="w-8 h-8 text-purple-500" />
                  <div className="text-center">
                    <div className="font-semibold">My Services</div>
                    <div className="text-xs text-gray-500">{approvedServices.length} approved</div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => setLocation("/dashboard/events")}
                  className="h-auto py-6 flex flex-col items-center gap-2"
                  variant="outline"
                  data-testid="card-my-events"
                >
                  <Calendar className="w-8 h-8 text-orange-500" />
                  <div className="text-center">
                    <div className="font-semibold">My Events</div>
                    <div className="text-xs text-gray-500">Manage events</div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => setLocation("/dashboard/inventory")}
                  className="h-auto py-6 flex flex-col items-center gap-2"
                  variant="outline"
                  data-testid="card-my-inventory"
                >
                  <Warehouse className="w-8 h-8 text-indigo-500" />
                  <div className="text-center">
                    <div className="font-semibold">My Inventory</div>
                    <div className="text-xs text-gray-500">Track stock</div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => setLocation("/dashboard/coupons")}
                  className="h-auto py-6 flex flex-col items-center gap-2"
                  variant="outline"
                  data-testid="card-coupons"
                >
                  <Ticket className="w-8 h-8 text-pink-500" />
                  <div className="text-center">
                    <div className="font-semibold">Coupons</div>
                    <div className="text-xs text-gray-500">Create discounts</div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => setLocation("/dashboard/pricing")}
                  className="h-auto py-6 flex flex-col items-center gap-2"
                  variant="outline"
                  data-testid="card-pricing-settings"
                >
                  <Receipt className="w-8 h-8 text-teal-500" />
                  <div className="text-center">
                    <div className="font-semibold">Pricing Settings</div>
                    <div className="text-xs text-gray-500">Payment methods</div>
                  </div>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <AddListingModal 
        isOpen={isAddListingModalOpen}
        onClose={() => setIsAddListingModalOpen(false)}
      />
      <AddProductModal 
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
      />
      <AddServiceModal 
        isOpen={isAddServiceModalOpen}
        onClose={() => setIsAddServiceModalOpen(false)}
      />
    </div>
  );
}
