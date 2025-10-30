import { Switch, Route } from "wouter";
import AdminDashboardLayout from "@/components/AdminDashboardLayout";
import AdminOverview from "./admin-overview";
import AdminAnalytics from "./admin-analytics";
import AdminTransactions from "./admin-transactions";
import AdminListings from "./admin-listings";
import AdminAddListing from "./admin-add-listing";
import AdminEditListing from "./admin-edit-listing";
import AdminUsers from "./admin-users";
import AdminVendors from "./admin-vendors";
import AdminRecycleBin from "./admin-recycle-bin";
import AdminPendingApprovals from "./admin-pending-approvals";
import AdminVendorRequests from "./admin-vendor-requests";
import AdminCoupons from "./admin-coupons";
import AdminActivityLogs from "./admin-activity-logs";
import AdminSupportTickets from "./admin-support-tickets";
import AdminStaff from "./admin-staff";
import AdminAuditLogs from "./admin-audit-logs";
import AdminEvents from "./admin-events";
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
        <Route path="/admin/analytics" component={AdminAnalytics} />
        <Route path="/admin/transactions" component={AdminTransactions} />
        <Route path="/admin/pending-approvals" component={AdminPendingApprovals} />
        <Route path="/admin/vendor-requests" component={AdminVendorRequests} />
        <Route path="/admin/vendors" component={AdminVendors} />
        <Route path="/admin/coupons" component={AdminCoupons} />
        <Route path="/admin/activity-logs" component={AdminActivityLogs} />
        <Route path="/admin/support-tickets" component={AdminSupportTickets} />
        <Route path="/admin/staff" component={AdminStaff} />
        <Route path="/admin/audit-logs" component={AdminAuditLogs} />
        <Route path="/admin/listings/new" component={AdminAddListing} />
        <Route path="/admin/listings/edit/:id" component={AdminEditListing} />
        <Route path="/admin/listings" component={AdminListings} />
        <Route path="/admin/events" component={AdminEvents} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/recycle-bin" component={AdminRecycleBin} />
        <Route path="/admin" component={AdminOverview} />
      </Switch>
    </AdminDashboardLayout>
  );
}
