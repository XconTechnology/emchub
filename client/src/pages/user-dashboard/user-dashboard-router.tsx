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
  LayoutDashboard
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

export default function UserDashboardRouter() {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    setLocation("/auth");
    return null;
  }

  const navigation = [
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
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-200 ease-in-out flex flex-col`}
      >
        {/* User info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate" data-testid="text-username">
                {user.username}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                {user.role || 'consumer'}
              </p>
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
                  <Link href={item.path}>
                    <a
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive(item.path)
                          ? "bg-brand-green text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      data-testid={item.testId}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={() => {
              logoutMutation.mutate(undefined, {
                onSuccess: () => {
                  setLocation("/");
                }
              });
            }}
            variant="outline"
            className="w-full justify-start gap-3"
            data-testid="button-logout"
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-8 py-4 flex justify-end items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-profile-menu">
                <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.username}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation("/dashboard")} data-testid="menu-dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>My Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/profile")} data-testid="menu-profile">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation("/settings")} data-testid="menu-settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  logoutMutation.mutate(undefined, {
                    onSuccess: () => {
                      setLocation("/");
                    }
                  });
                }}
                data-testid="menu-logout"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Content */}
        <div className="flex-1 container mx-auto p-4 lg:p-8">
          <Switch>
            <Route path="/dashboard" component={UserDashboardHome} />
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
