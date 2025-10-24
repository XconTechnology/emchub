import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { AdminAuthProvider } from "@/hooks/use-admin-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import ProfileRedirect from "@/pages/profile-redirect";
import AuthPage from "@/pages/auth-page";
import DirectoryPage from "@/pages/directory-page";
import MapPage from "@/pages/map-page";
import ProductsPage from "@/pages/products-page";
import BusinessDetail from "@/pages/business-detail";
import ProductDetailPage from "@/pages/product-detail-page";
import CategoryPage from "@/pages/category-page";
import AllCategoriesPage from "@/pages/all-categories-page";
import AboutUs from "@/pages/about-us";
import Explore from "@/pages/explore";
import AdminRouter from "@/pages/admin/admin-router";
import UserDashboardRouter from "@/pages/user-dashboard/user-dashboard-router";
import AccessDenied from "@/pages/access-denied";
import NotFound from "@/pages/not-found";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import { useEffect } from "react";

function Router() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={AuthPage} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/directory" component={DirectoryPage} />
      <Route path="/map" component={MapPage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/explore" component={Explore} />
      <Route path="/about-us" component={AboutUs} />
      <Route path="/categories" component={AllCategoriesPage} />
      <Route path="/category/:id" component={CategoryPage} />
      <Route path="/business/:id" component={BusinessDetail} />
      <Route path="/product/:id" component={ProductDetailPage} />
      <ProtectedRoute path="/profile" component={ProfileRedirect} />
      <Route path="/dashboard" component={UserDashboardRouter} />
      <Route path="/dashboard/vendor-orders" component={UserDashboardRouter} />
      <Route path="/dashboard/vendor-transactions" component={UserDashboardRouter} />
      <Route path="/dashboard/purchases" component={UserDashboardRouter} />
      <Route path="/dashboard/activity" component={UserDashboardRouter} />
      <Route path="/dashboard/become-vendor" component={UserDashboardRouter} />
      <Route path="/dashboard/cart" component={UserDashboardRouter} />
      <Route path="/dashboard/checkout" component={UserDashboardRouter} />
      <Route path="/dashboard/profile" component={UserDashboardRouter} />
      <Route path="/dashboard/settings" component={UserDashboardRouter} />
      <Route path="/dashboard/browse" component={UserDashboardRouter} />
      <Route path="/dashboard/reviews" component={UserDashboardRouter} />
      <Route path="/dashboard/timedollars" component={UserDashboardRouter} />
      <Route path="/dashboard/services" component={UserDashboardRouter} />
      <Route path="/dashboard/whatsapp" component={UserDashboardRouter} />
      <Route path="/dashboard/my-listings" component={UserDashboardRouter} />
      <Route path="/dashboard/create-listing" component={UserDashboardRouter} />
      <Route path="/dashboard/products" component={UserDashboardRouter} />
      <Route path="/dashboard/my-services" component={UserDashboardRouter} />
      <Route path="/dashboard/events" component={UserDashboardRouter} />
      <Route path="/dashboard/inventory" component={UserDashboardRouter} />
      <Route path="/dashboard/coupons" component={UserDashboardRouter} />
      <Route path="/dashboard/pricing" component={UserDashboardRouter} />
      <Route path="/dashboard/messages" component={UserDashboardRouter} />
      <Route path="/admin" component={AdminRouter} />
      <Route path="/admin/analytics" component={AdminRouter} />
      <Route path="/admin/transactions" component={AdminRouter} />
      <Route path="/admin/pending-approvals" component={AdminRouter} />
      <Route path="/admin/vendor-requests" component={AdminRouter} />
      <Route path="/admin/vendors" component={AdminRouter} />
      <Route path="/admin/coupons" component={AdminRouter} />
      <Route path="/admin/staff-help" component={AdminRouter} />
      <Route path="/admin/activity-logs" component={AdminRouter} />
      <Route path="/admin/listings" component={AdminRouter} />
      <Route path="/admin/listings/new" component={AdminRouter} />
      <Route path="/admin/listings/edit/:id" component={AdminRouter} />
      <Route path="/admin/users" component={AdminRouter} />
      <Route path="/admin/recycle-bin" component={AdminRouter} />
      <Route path="/access-denied" component={AccessDenied} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminAuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
