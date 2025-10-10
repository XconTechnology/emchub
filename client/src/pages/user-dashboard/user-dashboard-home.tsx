import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingBag, Star, DollarSign, Briefcase, Plus, Store, Package, Edit, Trash2, MapPin } from "lucide-react";
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
  const [isAddListingModalOpen, setIsAddListingModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  const { data: userListings, isLoading } = useQuery<Listing[]>({
    queryKey: ['/api/listings/user'],
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
      value: "0",
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
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

      <Tabs defaultValue="listings" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="listings" data-testid="tab-listings">
            Listings ({listings.length})
          </TabsTrigger>
          <TabsTrigger value="products" data-testid="tab-products">
            Products ({products.length})
          </TabsTrigger>
          <TabsTrigger value="services" data-testid="tab-services">
            Services ({services.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          ) : listings.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {listings.map(renderItemCard)}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No listings yet</p>
                <Button onClick={() => setIsAddListingModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Listing
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map(renderItemCard)}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No products yet</p>
                <Button onClick={() => setIsAddProductModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Product
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          ) : services.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map(renderItemCard)}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No services yet</p>
                <Button onClick={() => setIsAddServiceModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Service
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

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
