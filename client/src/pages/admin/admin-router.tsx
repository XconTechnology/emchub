import { Switch, Route } from "wouter";
import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import AdminOverview from "./admin-overview";
import AdminListings from "./admin-listings";
import AdminAddListing from "./admin-add-listing";
import AdminEditListing from "./admin-edit-listing";
import AdminUsers from "./admin-users";
import AdminRecycleBin from "./admin-recycle-bin";
import AdminLogin from "../admin-login";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useToast } from "@/hooks/use-toast";

export default function AdminRouter() {
  const { isAdminAuthenticated, checkAdminAuth } = useAdminAuth();
  const { toast } = useToast();

  const handleAdminLoginSuccess = () => {
    checkAdminAuth();
    toast({
      title: "Admin Login Successful",
      description: "Welcome to the admin dashboard",
    });
  };

  if (!isAdminAuthenticated) {
    return <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />;
  }

  return (
    <AdminDashboardLayout>
      <Switch>
        <Route path="/" component={AdminOverview} />
        <Route path="/listings" component={AdminListings} />
        <Route path="/listings/new" component={AdminAddListing} />
        <Route path="/listings/edit/:id" component={AdminEditListing} />
        <Route path="/users" component={AdminUsers} />
        <Route path="/recycle-bin" component={AdminRecycleBin} />
      </Switch>
    </AdminDashboardLayout>
  );
}
