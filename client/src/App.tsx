import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { AdminAuthProvider } from "@/hooks/use-admin-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import AuthPage from "@/pages/auth-page";
import DirectoryPage from "@/pages/directory-page";
import BusinessDetail from "@/pages/business-detail";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={AuthPage} />
      <Route path="/directory" component={DirectoryPage} />
      <Route path="/business/:id" component={BusinessDetail} />
      <ProtectedRoute path="/profile" component={Profile} />
      <Route path="/admin" component={AdminDashboard} />
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
