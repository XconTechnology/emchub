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
  BadgeCheck
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

export default function UserDashboardRouter() {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    setLocation("/auth");
    return null;
  }

  const navigation = [
    { name: "Profile", path: "/dashboard/profile", icon: UserIcon, testId: "nav-profile" },
    { name: "Browse", path: "/dashboard/browse", icon: Search, testId: "nav-browse" },
    { name: "My Reviews", path: "/dashboard/reviews", icon: Star, testId: "nav-reviews" },
    { name: "TimeDollars", path: "/dashboard/timedollars", icon: DollarSign, testId: "nav-timedollars" },
    { name: "Request Service", path: "/dashboard/services", icon: Briefcase, testId: "nav-services" },
    { name: "WhatsApp Group", path: "/dashboard/whatsapp", icon: MessageCircle, testId: "nav-whatsapp" },
  ];

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
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            {user.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt="Profile" 
                className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
                <span className="text-white font-semibold text-lg">
                  {user.firstName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                  {user.lastName?.[0]?.toUpperCase() || ''}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <h3 className="font-semibold text-white truncate" data-testid="text-username">
                  {user.username}
                </h3>
                {user.vendorStatus === 'verified' && (
                  <BadgeCheck className="w-5 h-5 fill-blue-500 text-white flex-shrink-0" data-testid="badge-verified-vendor-sidebar" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link 
                    href={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? "bg-white/20 text-white font-semibold"
                        : "text-white hover:bg-white/10 hover:text-white"
                    }`}
                    data-testid={item.testId}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
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
        <header className="px-4 lg:px-8 py-4 flex justify-between items-center border-b border-white/20" style={{ backgroundColor: '#8FC24C' }}>
          <h1 className="text-xl font-semibold text-white">
            {location === "/dashboard" && "Dashboard"}
            {location === "/dashboard/profile" && "Profile"}
            {location === "/dashboard/settings" && "Settings"}
            {location === "/dashboard/browse" && "Browse"}
            {location === "/dashboard/reviews" && "My Reviews"}
            {location === "/dashboard/timedollars" && "TimeDollars"}
            {location === "/dashboard/services" && "Request Service"}
            {location === "/dashboard/whatsapp" && "WhatsApp Group"}
          </h1>
          
          <div className="flex items-center gap-3">
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" data-testid="button-profile-menu">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium leading-none">{user?.username}</p>
                      {user?.vendorStatus === 'verified' && (
                        <BadgeCheck className="w-4 h-4 fill-blue-500 text-white flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/dashboard")} data-testid="menu-dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>My Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/dashboard/profile")} data-testid="menu-profile">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/dashboard/settings")} data-testid="menu-settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 container mx-auto p-4 lg:p-8">
          <Switch>
            <Route path="/dashboard" component={UserDashboardHome} />
            <Route path="/dashboard/profile" component={Profile} />
            <Route path="/dashboard/settings" component={UserSettings} />
            <Route path="/dashboard/browse" component={UserBrowse} />
            <Route path="/dashboard/reviews" component={UserReviews} />
            <Route path="/dashboard/timedollars" component={UserTimeDollars} />
            <Route path="/dashboard/services" component={UserServices} />
            <Route path="/dashboard/whatsapp" component={UserWhatsApp} />
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
