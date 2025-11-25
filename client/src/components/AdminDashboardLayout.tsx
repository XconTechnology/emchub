import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  List,
  Plus,
  Users,
  Trash2,
  LogOut,
  Clock,
  ShieldCheck,
  Ticket,
  HelpCircle,
  Activity,
  Store,
  BarChart3,
  CreditCard,
  LifeBuoy,
  UserCog,
  Calendar,
  ExternalLink,
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
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useToast } from "@/hooks/use-toast";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const [location] = useLocation();
  const { adminLogout } = useAdminAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    adminLogout();
    toast({
      title: "Logged Out",
      description: "You have been logged out of the admin panel",
    });
  };

  const adminNavItems = [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: BarChart3,
    },
    {
      title: "Transactions",
      url: "/admin/transactions",
      icon: CreditCard,
    },
    {
      title: "Pending Approvals",
      url: "/admin/pending-approvals",
      icon: Clock,
    },
    {
      title: "Vendor Requests",
      url: "/admin/vendor-requests",
      icon: ShieldCheck,
    },
    {
      title: "Vendors",
      url: "/admin/vendors",
      icon: Store,
    },
    {
      title: "Coupons",
      url: "/admin/coupons",
      icon: Ticket,
    },
    {
      title: "Activity Logs",
      url: "/admin/activity-logs",
      icon: Activity,
    },
    {
      title: "Support Tickets",
      url: "/admin/support-tickets",
      icon: LifeBuoy,
    },
    {
      title: "All Listings",
      url: "/admin/listings",
      icon: List,
    },
    {
      title: "Events",
      url: "/admin/events",
      icon: Calendar,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "Staff",
      url: "/admin/staff",
      icon: UserCog,
    },
    {
      title: "Recycle Bin",
      url: "/admin/recycle-bin",
      icon: Trash2,
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
        <Sidebar className="border-r border-gray-200 dark:border-gray-800">
          <SidebarHeader className="p-4 border-b border-gray-200 dark:border-gray-800">
            <Link href="/admin">
              <div className="flex items-center gap-2 cursor-pointer" data-testid="admin-sidebar-logo">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-foreground">Admin Panel</span>
                  <span className="text-xs text-muted-foreground">EMC HUB</span>
                </div>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel>Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
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
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
              data-testid="button-admin-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center border-b bg-background px-4">
            <SidebarTrigger data-testid="sidebar-toggle" />
            <Separator orientation="vertical" className="h-8 mx-2" />
            
            {/* Centered heading */}
            <h1 className="flex-1 text-lg font-semibold text-center">
              {location === "/admin" && "Dashboard Overview"}
              {location === "/admin/analytics" && "Platform Analytics"}
              {location === "/admin/pending-approvals" && "Pending Approvals"}
              {location === "/admin/vendor-requests" && "Vendor Requests"}
              {location === "/admin/vendors" && "Verified Vendors"}
              {location === "/admin/coupons" && "Coupon Management"}
              {location === "/admin/activity-logs" && "Activity Logs"}
              {location === "/admin/support-tickets" && "Support Tickets"}
              {location === "/admin/listings" && "All Listings"}
              {location === "/admin/listings/new" && "Add New Listing"}
              {location === "/admin/events" && "Events Management"}
              {location === "/admin/timedollars" && "TimeDollars Management"}
              {location === "/admin/disputes" && "Disputes"}
              {location === "/admin/users" && "Users"}
              {location === "/admin/staff" && "Staff Management"}
              {location === "/admin/audit-logs" && "Staff Audit Logs"}
              {location === "/admin/recycle-bin" && "Recycle Bin"}
              {location === "/admin/transactions" && "Transactions"}
            </h1>
            
            {/* View Site button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("/", "_blank")}
              className="gap-1.5 ml-2"
              data-testid="button-admin-view-site"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">View Site</span>
            </Button>
          </header>
          <div className="flex-1 p-6">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
