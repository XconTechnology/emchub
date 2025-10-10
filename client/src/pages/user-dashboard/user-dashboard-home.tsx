import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats Overview</CardTitle>
          <CardDescription>Your marketplace performance at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Business Listings</p>
                  <p className="text-2xl font-bold">{approvedListings.length}</p>
                </div>
                <Store className="w-10 h-10 text-blue-500" />
              </div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
                  <p className="text-2xl font-bold">{approvedProducts.length}</p>
                </div>
                <Package className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Services</p>
                  <p className="text-2xl font-bold">{approvedServices.length}</p>
                </div>
                <Briefcase className="w-10 h-10 text-purple-500" />
              </div>
            </div>
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
