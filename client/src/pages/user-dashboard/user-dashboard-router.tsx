import { useState, useEffect } from "react";
import { Route, Switch, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Truck,
  LifeBuoy,
  Heart,
  ExternalLink
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
import UserRecycleBin from "./user-recycle-bin";
import UserVendorOrders from "./user-vendor-orders";
import UserVendorTransactions from "./user-vendor-transactions";
import UserChats from "./user-chats";
import VendorMessages from "./vendor-messages";
import UserSupportTickets from "./user-support-tickets";
import VendorSupportTickets from "./vendor-support-tickets";
import VendorSupportTicketChat from "./vendor-support-ticket-chat";
import UserSavedItems from "./user-saved-items";
import VendorReviews from "../vendor-dashboard/vendor-reviews";

export default function UserDashboardRouter() {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch unread message count
  const { data: unreadCountData } = useQuery<{ count: number }>({
    queryKey: ['/api/messages/unread/count'],
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) {
      setLocation("/auth");
    }
  }, [user, setLocation]);

  if (!user) {
    return null;
  }

  const unreadCount = unreadCountData?.count || 0;

  // Navigation items for normal users (non-vendors)
  const normalUserNavigation = [
    { name: "My Dashboard", path: "/dashboard", icon: LayoutDashboard, testId: "nav-dashboard" },
    { name: "Saved Items", path: "/dashboard/saved-items", icon: Heart, testId: "nav-saved-items" },
    { name: "My Purchases", path: "/dashboard/purchases", icon: ShoppingBag, testId: "nav-purchases" },
    { name: "My Chats", path: "/dashboard/messages", icon: MessageCircle, testId: "nav-messages", badge: unreadCount > 0 ? unreadCount : undefined },
    { name: "Request Service", path: "/dashboard/services", icon: Briefcase, testId: "nav-services" },
    { name: "Support Tickets", path: "/dashboard/support-tickets", icon: LifeBuoy, testId: "nav-support-tickets" },
    { name: "My Activity", path: "/dashboard/activity", icon: Activity, testId: "nav-activity" },
    { name: "Profile & Settings", path: "/dashboard/profile", icon: UserIcon, testId: "nav-profile" },
  ];

  // Navigation items for verified vendors
  const vendorNavigation = [
    { name: "My Dashboard", path: "/dashboard", icon: LayoutDashboard, testId: "nav-dashboard" },
    { name: "Vendor Orders", path: "/dashboard/vendor-orders", icon: Truck, testId: "nav-vendor-orders" },
    { name: "Messages", path: "/dashboard/messages", icon: MessageCircle, testId: "nav-messages", badge: unreadCount > 0 ? unreadCount : undefined },
    { name: "Transactions", path: "/dashboard/vendor-transactions", icon: Receipt, testId: "nav-vendor-transactions" },
    { name: "Saved Items", path: "/dashboard/saved-items", icon: Heart, testId: "nav-saved-items" },
    { name: "My Purchases", path: "/dashboard/purchases", icon: ShoppingBag, testId: "nav-purchases" },
    { name: "Support Tickets", path: "/dashboard/support-tickets", icon: LifeBuoy, testId: "nav-support-tickets" },
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
        {/* EMC HUB Logo/Link */}
        <div className="p-6 pl-20 lg:pl-6 border-b border-white/10">
          <Link href="/" data-testid="link-emc-hub-home">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity">
              <h3 className="font-bold text-white text-xl" data-testid="text-emc-hub">
                EMC HUB
              </h3>
              {user.vendorStatus === 'verified' && (
                <BadgeCheck className="w-5 h-5 fill-blue-500 text-white flex-shrink-0" data-testid="badge-verified-vendor-sidebar" />
              )}
            </div>
          </Link>
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
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive(item.path)
                        ? "bg-white text-[#8FC24C] font-semibold shadow-md"
                        : "text-white/90 hover:bg-white/30 hover:text-white hover:shadow-md"
                    }`}
                    data-testid={item.testId}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {item.badge && (
                      <Badge 
                        variant="destructive" 
                        className="ml-auto bg-red-500 text-white text-xs"
                        data-testid={`badge-unread-${item.testId}`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout button at the bottom of sidebar */}
        <div className="p-3 border-t border-white/10">
          <Button
            onClick={() => {
              logoutMutation.mutate(undefined, {
                onSuccess: () => {
                  setLocation("/");
                }
              });
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-white/90 hover:bg-white/15 hover:text-white hover:shadow-sm bg-transparent border-0"
            data-testid="button-logout-sidebar"
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 pl-14 pr-3 lg:px-8 py-3 flex items-center justify-between border-b border-white/20 shadow-md" style={{ backgroundColor: '#8FC24C' }}>
          {/* Centered heading */}
          <h1 className="flex-1 text-lg sm:text-xl font-semibold text-white text-center px-2">
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
            {location === "/dashboard/vendor-orders" && "Vendor Orders"}
            {location === "/dashboard/vendor-transactions" && "Transactions"}
            {location === "/dashboard/messages" && (user?.vendorStatus === 'verified' ? "Messages" : "My Chats")}
            {location === "/dashboard/support-tickets" && "Support Tickets"}
            {location === "/dashboard/vendor-support-tickets" && "Assigned Tickets"}
            {location.startsWith("/dashboard/vendor-support-tickets/") && "Ticket Chat"}
            {location === "/dashboard/cart" && "My Cart"}
            {location === "/dashboard/checkout" && "Checkout"}
            {location === "/dashboard/recycle-bin" && "Recycle Bin"}
            {location === "/dashboard/saved-items" && "Saved Items"}
          </h1>
          
          {/* Right side buttons */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* View Live Site button */}
            <Button
              onClick={() => window.open("/", "_blank")}
              size="sm"
              className="bg-white/20 text-white hover:bg-white/30 border-0 p-2 sm:px-3 sm:py-2"
              data-testid="button-view-site"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline ml-1.5">View Site</span>
            </Button>
            
            {/* Show Become a Vendor button for normal users only */}
            {user?.vendorStatus !== 'verified' && (
              <Button
                onClick={() => setLocation("/dashboard/become-vendor")}
                size="sm"
                className="bg-white/20 text-white hover:bg-white/30 border-0 p-2 sm:px-3 sm:py-2"
                data-testid="button-become-vendor-navbar"
              >
                <BadgeDollarSign className="w-4 h-4" />
                <span className="hidden sm:inline ml-1.5">Become Vendor</span>
              </Button>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 container mx-auto p-4 lg:p-8">
          <Switch>
            <Route path="/dashboard" component={UserDashboardHome} />
            <Route path="/dashboard/vendor-orders" component={UserVendorOrders} />
            <Route path="/dashboard/vendor-transactions" component={UserVendorTransactions} />
            <Route path="/dashboard/purchases" component={UserPurchases} />
            <Route path="/dashboard/activity" component={UserActivity} />
            <Route path="/dashboard/become-vendor" component={UserBecomeVendor} />
            <Route path="/dashboard/profile" component={Profile} />
            <Route path="/dashboard/settings" component={UserSettings} />
            <Route path="/dashboard/browse" component={UserBrowse} />
            <Route path="/dashboard/reviews">
              {user?.vendorStatus === 'verified' ? <VendorReviews /> : <UserReviews />}
            </Route>
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
            <Route path="/dashboard/recycle-bin" component={UserRecycleBin} />
            <Route path="/dashboard/saved-items" component={UserSavedItems} />
            <Route path="/dashboard/support-tickets" component={UserSupportTickets} />
            <Route path="/dashboard/vendor-support-tickets/:id" component={VendorSupportTicketChat} />
            <Route path="/dashboard/vendor-support-tickets" component={VendorSupportTickets} />
            <Route path="/dashboard/messages">
              {user?.vendorStatus === 'verified' ? <VendorMessages /> : <UserChats />}
            </Route>
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
