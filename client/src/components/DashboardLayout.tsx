import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  User,
  MapPin,
  List,
  Settings,
  LogOut,
  Home,
  ShieldCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useAdminAuth } from "@/hooks/use-admin-auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { isAdminAuthenticated, adminLogout } = useAdminAuth();

  const handleLogout = () => {
    if (location === "/admin") {
      adminLogout();
    } else {
      logout();
    }
  };

  const mainNavItems = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Directory",
      url: "/directory",
      icon: List,
    },
    {
      title: "Map View",
      url: "/map",
      icon: MapPin,
    },
  ];

  const userNavItems = user
    ? [
        {
          title: "Profile",
          url: "/profile",
          icon: User,
        },
      ]
    : [];

  const adminNavItems = isAdminAuthenticated
    ? [
        {
          title: "Admin Dashboard",
          url: "/admin",
          icon: ShieldCheck,
        },
      ]
    : [];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="wp-sidebar">
          <SidebarHeader className="p-4">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer" data-testid="sidebar-logo">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-foreground">Dashboard</span>
                  <span className="text-xs text-muted-foreground">Local Business Directory</span>
                </div>
              </div>
            </Link>
          </SidebarHeader>

          <Separator />

          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mainNavItems.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.url}
                        data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <Link href={item.url}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {(userNavItems.length > 0 || adminNavItems.length > 0) && (
              <>
                <Separator className="my-2" />
                <SidebarGroup>
                  <SidebarGroupLabel>Account</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {userNavItems.map((item) => (
                        <SidebarMenuItem key={item.url}>
                          <SidebarMenuButton
                            asChild
                            isActive={location === item.url}
                            data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <Link href={item.url}>
                              <item.icon className="w-4 h-4" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                      {adminNavItems.map((item) => (
                        <SidebarMenuItem key={item.url}>
                          <SidebarMenuButton
                            asChild
                            isActive={location === item.url}
                            data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <Link href={item.url}>
                              <item.icon className="w-4 h-4" />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </>
            )}
          </SidebarContent>

          <SidebarFooter className="p-4">
            {user && (
              <>
                <div className="mb-3 p-3 bg-sidebar-accent rounded-lg" data-testid="user-info">
                  <div className="flex items-center gap-3">
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-foreground">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-sidebar-foreground truncate" data-testid="user-name">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.username}
                      </p>
                      <p className="text-xs text-muted-foreground truncate" data-testid="user-email">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLogout}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            )}
            {!user && (
              <Link href="/auth">
                <Button variant="default" className="w-full" data-testid="button-login">
                  Login / Sign Up
                </Button>
              </Link>
            )}
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="wp-content-area">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger data-testid="sidebar-toggle" />
            <Separator orientation="vertical" className="h-8" />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">
                {location === "/profile" && "Profile"}
                {location === "/admin" && "Admin Dashboard"}
                {location === "/directory" && "Business Directory"}
                {location === "/map" && "Map View"}
                {location === "/" && "Home"}
              </h1>
            </div>
          </header>
          <div className="flex-1 p-6">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
