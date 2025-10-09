import { Switch, Route } from "wouter";
import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import AdminOverview from "./admin-overview";
import AdminListings from "./admin-listings";
import AdminAddListing from "./admin-add-listing";
import AdminEditListing from "./admin-edit-listing";
import AdminUsers from "./admin-users";
import AdminRecycleBin from "./admin-recycle-bin";
import AdminPendingApprovals from "./admin-pending-approvals";
import AdminVendorRequests from "./admin-vendor-requests";
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
        <Route path="/admin/pending-approvals" component={AdminPendingApprovals} />
        <Route path="/admin/vendor-requests" component={AdminVendorRequests} />
        <Route path="/admin/listings/new" component={AdminAddListing} />
        <Route path="/admin/listings/edit/:id" component={AdminEditListing} />
        <Route path="/admin/listings" component={AdminListings} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/recycle-bin" component={AdminRecycleBin} />
        <Route path="/admin" component={AdminOverview} />
      </Switch>
    </AdminDashboardLayout>
  );
}
