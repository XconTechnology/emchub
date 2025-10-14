import { useState } from "react";
import { Route, Switch, Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Star, 
  DollarSign, 
  Briefcase, 
  MessageCircle,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Settings,
  LayoutDashboard,
  BadgeCheck,
  Package,
  Calendar,
  Warehouse,
  Ticket,
  Receipt,
  Store,
  ShoppingCart,
  ShoppingBag,
  Activity,
  BadgeDollarSign,
  Mail,
  Headphones
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserDashboardHome from "./user-dashboard-home";
import UserBrowse from "./user-browse";
import UserReviews from "./user-reviews";
import UserTimeDollars from "./user-timedollars";
import UserServices from "./user-services";
import UserWhatsApp from "./user-whatsapp";
import Profile from "../profile";
import UserSettings from "./user-settings";
import UserProducts from "./user-products";
import UserMyServices from "./user-my-services";
import UserEvents from "./user-events";
import UserInventory from "./user-inventory";
import UserCoupons from "./user-coupons";
import UserPricing from "./user-pricing";
import UserMyListings from "./user-my-listings";
import UserCreateListing from "./user-create-listing";
import UserCart from "./user-cart";
import UserCheckout from "./user-checkout";
import UserPurchases from "./user-purchases";
import UserActivity from "./user-activity";
import UserBecomeVendor from "./user-become-vendor";
import UserMessages from "./user-messages";
import UserSupport from "./user-support";

export default function UserDashboardRouter() {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    setLocation("/auth");
    return null;
  }

  // Navigation items for normal users (non-vendors)
  const normalUserNavigation = [
    { name: "My Dashboard", path: "/dashboard", icon: LayoutDashboard, testId: "nav-dashboard" },
    { name: "My Purchases", path: "/dashboard/purchases", icon: ShoppingBag, testId: "nav-purchases" },
    { name: "Messages", path: "/dashboard/messages", icon: Mail, testId: "nav-messages" },
    { name: "Support", path: "/dashboard/support", icon: Headphones, testId: "nav-support" },
    { name: "My Activity", path: "/dashboard/activity", icon: Activity, testId: "nav-activity" },
    { name: "Profile & Settings", path: "/dashboard/profile", icon: UserIcon, testId: "nav-profile" },
    { name: "Become a Vendor", path: "/dashboard/become-vendor", icon: BadgeDollarSign, testId: "nav-become-vendor" },
  ];

  // Navigation items for verified vendors
  const vendorNavigation = [
    { name: "My Dashboard", path: "/dashboard", icon: LayoutDashboard, testId: "nav-dashboard" },
    { name: "My Purchases", path: "/dashboard/purchases", icon: ShoppingBag, testId: "nav-purchases" },
    { name: "Messages", path: "/dashboard/messages", icon: Mail, testId: "nav-messages" },
    { name: "Support", path: "/dashboard/support", icon: Headphones, testId: "nav-support" },
    { name: "My Activity", path: "/dashboard/activity", icon: Activity, testId: "nav-activity" },
    { name: "Profile", path: "/dashboard/profile", icon: UserIcon, testId: "nav-profile" },
    { name: "My Reviews", path: "/dashboard/reviews", icon: Star, testId: "nav-reviews" },
    { name: "TimeDollars", path: "/dashboard/timedollars", icon: DollarSign, testId: "nav-timedollars" },
    { name: "Request Service", path: "/dashboard/services", icon: Briefcase, testId: "nav-services" },
    { name: "WhatsApp Group", path: "/dashboard/whatsapp", icon: MessageCircle, testId: "nav-whatsapp" },
    { name: "Settings", path: "/dashboard/settings", icon: Settings, testId: "nav-settings" },
  ];

  const navigation = user?.vendorStatus === 'verified' ? vendorNavigation : normalUserNavigation;

  const isActive = (path: string) => location === path;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md"
        data-testid="button-toggle-sidebar"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 transition-transform duration-200 ease-in-out flex flex-col`}
        style={{ backgroundColor: '#8FC24C' }}
      >
        {/* User info */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-lg truncate" data-testid="text-username">
              {user.username}
            </h3>
            {user.vendorStatus === 'verified' && (
              <BadgeCheck className="w-5 h-5 fill-blue-500 text-white flex-shrink-0" data-testid="badge-verified-vendor-sidebar" />
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link 
                    href={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive(item.path)
                        ? "bg-white text-[#8FC24C] font-semibold shadow-md"
                        : "text-white/90 hover:bg-white/15 hover:text-white hover:shadow-sm"
                    }`}
                    data-testid={item.testId}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 px-4 lg:px-8 py-4 flex justify-between items-center border-b border-white/20 shadow-md" style={{ backgroundColor: '#8FC24C' }}>
          <h1 className="text-xl font-semibold text-white">
            {location === "/dashboard" && "Dashboard"}
            {location === "/dashboard/purchases" && "My Purchases"}
            {location === "/dashboard/activity" && "My Activity"}
            {location === "/dashboard/profile" && "Profile"}
            {location === "/dashboard/settings" && "Settings"}
            {location === "/dashboard/become-vendor" && "Become a Vendor"}
            {location === "/dashboard/browse" && "Browse"}
            {location === "/dashboard/reviews" && "My Reviews"}
            {location === "/dashboard/timedollars" && "TimeDollars"}
            {location === "/dashboard/services" && "Request Service"}
            {location === "/dashboard/whatsapp" && "WhatsApp Group"}
            {location === "/dashboard/my-listings" && "My Listings"}
            {location === "/dashboard/create-listing" && "Create Listing"}
            {location === "/dashboard/products" && "My Products"}
            {location === "/dashboard/my-services" && "My Services"}
            {location === "/dashboard/events" && "My Events"}
            {location === "/dashboard/inventory" && "My Inventory"}
            {location === "/dashboard/coupons" && "Coupons"}
            {location === "/dashboard/pricing" && "Pricing Settings"}
            {location === "/dashboard/cart" && "My Cart"}
            {location === "/dashboard/checkout" && "Checkout"}
          </h1>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setLocation("/dashboard/browse")}
              className="gap-2 bg-white/20 text-white hover:bg-white/30 border-0"
              data-testid="button-browse-navbar"
            >
              <Search className="w-4 h-4" />
              Browse
            </Button>
            
            <Button
              onClick={() => setLocation("/dashboard/cart")}
              className="gap-2 bg-white/20 text-white hover:bg-white/30 border-0"
              data-testid="button-cart-navbar"
            >
              <ShoppingCart className="w-4 h-4" />
              Cart
            </Button>
            
            <Button
              onClick={() => {
                logoutMutation.mutate(undefined, {
                  onSuccess: () => {
                    setLocation("/");
                  }
                });
              }}
              className="gap-2 bg-white/20 text-white hover:bg-white/30 border-0"
              data-testid="button-logout"
              disabled={logoutMutation.isPending}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 container mx-auto p-4 lg:p-8">
          <Switch>
            <Route path="/dashboard" component={UserDashboardHome} />
            <Route path="/dashboard/purchases" component={UserPurchases} />
            <Route path="/dashboard/messages" component={UserMessages} />
            <Route path="/dashboard/support" component={UserSupport} />
            <Route path="/dashboard/activity" component={UserActivity} />
            <Route path="/dashboard/become-vendor" component={UserBecomeVendor} />
            <Route path="/dashboard/profile" component={Profile} />
            <Route path="/dashboard/settings" component={UserSettings} />
            <Route path="/dashboard/browse" component={UserBrowse} />
            <Route path="/dashboard/reviews" component={UserReviews} />
            <Route path="/dashboard/timedollars" component={UserTimeDollars} />
            <Route path="/dashboard/services" component={UserServices} />
            <Route path="/dashboard/whatsapp" component={UserWhatsApp} />
            <Route path="/dashboard/my-listings" component={UserMyListings} />
            <Route path="/dashboard/create-listing" component={UserCreateListing} />
            <Route path="/dashboard/products" component={UserProducts} />
            <Route path="/dashboard/my-services" component={UserMyServices} />
            <Route path="/dashboard/events" component={UserEvents} />
            <Route path="/dashboard/inventory" component={UserInventory} />
            <Route path="/dashboard/coupons" component={UserCoupons} />
            <Route path="/dashboard/pricing" component={UserPricing} />
            <Route path="/dashboard/cart" component={UserCart} />
            <Route path="/dashboard/checkout" component={UserCheckout} />
          </Switch>
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
