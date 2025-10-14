import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Store, Mail, User, Phone, Calendar, MapPin, Building } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType } from "@shared/schema";

export default function AdminVendors() {
  const { toast } = useToast();
  
  const { data: vendors = [], isLoading } = useQuery<UserType[]>({
    queryKey: ['/api/admin/vendors'],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await apiRequest('PATCH', `/api/admin/users/${userId}/role`, { role });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/vendors'] });
      toast({
        title: "Success",
        description: data.message || "Vendor role updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update vendor role",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'N/A';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading vendors...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verified Vendors</h2>
          <p className="text-muted-foreground mt-1">
            Manage all verified vendor accounts on your platform
          </p>
        </div>
      </div>

      {vendors.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white">No verified vendors yet</p>
            <p className="text-muted-foreground mt-2">
              Approved vendor requests will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Total Vendors: {vendors.length}
          </div>

          <div className="grid gap-4">
            {vendors.map((vendor) => (
              <Card key={vendor.id} data-testid={`vendor-card-${vendor.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Store className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white" data-testid={`vendor-name-${vendor.id}`}>
                            {vendor.username}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="default" data-testid={`vendor-role-${vendor.id}`}>
                              <Store className="w-3 h-3 mr-1" />
                              {vendor.role}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {vendor.email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            <span data-testid={`vendor-email-${vendor.id}`}>{vendor.email}</span>
                          </div>
                        )}
                        {vendor.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <span data-testid={`vendor-phone-${vendor.id}`}>{vendor.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span data-testid={`vendor-joined-${vendor.id}`}>
                            Joined: {formatDate(vendor.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="lg:w-48 space-y-2">
                      <Select
                        value={vendor.role}
                        onValueChange={(value) => updateRoleMutation.mutate({ userId: vendor.id, role: value })}
                        data-testid={`select-role-${vendor.id}`}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consumer">Consumer</SelectItem>
                          <SelectItem value="vendor">Vendor</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
