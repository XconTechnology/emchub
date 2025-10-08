import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Mail, User, Trash } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { User as UserType } from "@shared/schema";

export default function AdminUsers() {
  const { toast } = useToast();
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  
  const { data: users = [], isLoading } = useQuery<UserType[]>({
    queryKey: ['/api/admin/users'],
    queryFn: () => fetch('/api/admin/users', { credentials: 'include' }).then(res => res.json()),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await apiRequest('POST', '/api/admin/users/bulk-delete', { ids });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Success",
        description: data.message || "Users deleted successfully",
      });
      setSelectedUsers(new Set());
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete users",
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await apiRequest('PATCH', `/api/admin/users/${userId}/role`, { role });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Success",
        description: data.message || "User role updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
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

  const toggleUserSelection = (id: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = (users: UserType[]) => {
    if (selectedUsers.size === users.length && users.length > 0) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedUsers.size === 0) return;
    bulkDeleteMutation.mutate(Array.from(selectedUsers));
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h2>
          <p className="text-muted-foreground mt-1">
            Manage all registered users on your platform
          </p>
        </div>
        {users.length > 0 && (
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-2 mr-4">
              <Checkbox
                checked={selectedUsers.size === users.length && users.length > 0}
                onCheckedChange={() => toggleSelectAll(users)}
                data-testid="checkbox-select-all"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Select All ({selectedUsers.size} selected)
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={selectedUsers.size === 0 || bulkDeleteMutation.isPending}
              data-testid="button-bulk-delete"
            >
              <Trash className="w-4 h-4 mr-1" />
              Delete Selected
            </Button>
          </div>
        )}
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No users found</p>
          </CardContent>
        </Card>
      ) : (
        users.map((user) => {
          const isSelected = selectedUsers.has(user.id);
          return (
            <Card key={user.id} className="mb-4" data-testid={`user-card-${user.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleUserSelection(user.id)}
                      data-testid={`checkbox-user-${user.id}`}
                    />
                    <div className="flex-1">
                      <CardTitle className="text-lg">{user.firstName} {user.lastName}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} data-testid={`user-role-${user.id}`}>
                          {user.role}
                        </Badge>
                        <span className="text-sm text-gray-500">@{user.username}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(user.createdAt)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4 mr-2" />
                    {user.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4 mr-2" />
                    User ID: {user.id}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Role:</span>
                    <Select
                      value={user.role}
                      onValueChange={(role) => updateRoleMutation.mutate({ userId: user.id, role })}
                      disabled={updateRoleMutation.isPending}
                    >
                      <SelectTrigger className="w-[140px] h-8" data-testid={`select-role-${user.id}`}>
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
          );
        })
      )}
    </div>
  );
}
