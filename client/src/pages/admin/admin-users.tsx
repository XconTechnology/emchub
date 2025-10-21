import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Mail, User, Phone, Search, Filter, Edit, Ban, CheckCircle, Key } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { User as UserType } from "@shared/schema";

export default function AdminUsers() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserType | null>(null);
  const [newPassword, setNewPassword] = useState("");
  
  const { data: users = [], isLoading } = useQuery<UserType[]>({
    queryKey: ['/api/admin/users', { search: searchQuery, role: roleFilter, status: statusFilter }],
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<UserType> }) => {
      const res = await apiRequest('PUT', `/api/admin/users/${userId}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const suspendUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest('POST', `/api/admin/users/${userId}/suspend`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Success",
        description: "User suspended successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to suspend user",
        variant: "destructive",
      });
    },
  });

  const reactivateUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest('POST', `/api/admin/users/${userId}/reactivate`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Success",
        description: "User reactivated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reactivate user",
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      const res = await apiRequest('POST', `/api/admin/users/${userId}/reset-password`, { newPassword });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password reset successfully",
      });
      setResetPasswordUser(null);
      setNewPassword("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
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

  const handleUpdateUser = () => {
    if (!editingUser) return;
    
    const updates: Partial<UserType> = {
      username: editingUser.username,
      bio: editingUser.bio || undefined,
      profileImageUrl: editingUser.profileImageUrl || undefined,
      role: editingUser.role,
      vendorStatus: editingUser.vendorStatus,
      status: editingUser.status,
      timeDollarBalance: editingUser.timeDollarBalance,
      tdCashSplitPercentage: editingUser.tdCashSplitPercentage,
    };
    
    // Only include PII fields if they exist (super-admin only)
    if (editingUser.email) updates.email = editingUser.email;
    if (editingUser.phone) updates.phone = editingUser.phone;
    if (editingUser.firstName) updates.firstName = editingUser.firstName;
    if (editingUser.lastName) updates.lastName = editingUser.lastName;
    
    updateUserMutation.mutate({ userId: editingUser.id, updates });
  };

  const handleResetPassword = () => {
    if (!resetPasswordUser || !newPassword) return;
    
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }
    
    resetPasswordMutation.mutate({ userId: resetPasswordUser.id, newPassword });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          User Management
        </h2>
        <p className="text-muted-foreground mt-2">
          Manage all registered users on your platform
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, email, phone, or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role-filter">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger id="role-filter" data-testid="select-role-filter">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Roles</SelectItem>
                  <SelectItem value="consumer">Consumer</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super-admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter" data-testid="select-status-filter">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>TD Balance</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {user.profileImageUrl ? (
                            <img
                              src={user.profileImageUrl}
                              alt={user.username}
                              className="w-10 h-10 rounded-full object-cover"
                              data-testid={`img-avatar-${user.id}`}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-white">
                                {user.username[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium" data-testid={`text-username-${user.id}`}>
                              {user.username}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {user.email ? (
                            <div className="flex items-center gap-1 text-sm" data-testid={`text-email-${user.id}`}>
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">No email</div>
                          )}
                          {user.phone && (
                            <div className="flex items-center gap-1 text-sm" data-testid={`text-phone-${user.id}`}>
                              <Phone className="w-3 h-3" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' || user.role === 'super-admin' ? 'default' : 'secondary'} data-testid={`badge-role-${user.id}`}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.status === 'active' ? 'default' : 'destructive'}
                          data-testid={`badge-status-${user.id}`}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-balance-${user.id}`}>
                        {user.timeDollarBalance || 0} TD
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingUser(user)}
                            data-testid={`button-edit-${user.id}`}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          {user.status === 'active' ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => suspendUserMutation.mutate(user.id)}
                              disabled={suspendUserMutation.isPending}
                              data-testid={`button-suspend-${user.id}`}
                            >
                              <Ban className="w-3 h-3" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => reactivateUserMutation.mutate(user.id)}
                              disabled={reactivateUserMutation.isPending}
                              data-testid={`button-reactivate-${user.id}`}
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setResetPasswordUser(user)}
                            data-testid={`button-reset-password-${user.id}`}
                          >
                            <Key className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-edit-user">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Only super-admins can edit PII fields (email, phone, first name, last name).
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    data-testid="input-edit-username"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select 
                    value={editingUser.role} 
                    onValueChange={(role) => setEditingUser({ ...editingUser, role })}
                  >
                    <SelectTrigger id="role" data-testid="select-edit-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consumer">Consumer</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super-admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* PII Fields - only show if data exists (super-admin access) */}
              {(editingUser.email || editingUser.phone || editingUser.firstName || editingUser.lastName) && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                      PII Fields (Super-Admin Only)
                    </p>
                  </div>
                  {editingUser.firstName !== undefined && (
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={editingUser.firstName || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                        data-testid="input-edit-firstname"
                      />
                    </div>
                  )}
                  {editingUser.lastName !== undefined && (
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={editingUser.lastName || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                        data-testid="input-edit-lastname"
                      />
                    </div>
                  )}
                  {editingUser.email !== undefined && (
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editingUser.email || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                        data-testid="input-edit-email"
                      />
                    </div>
                  )}
                  {editingUser.phone !== undefined && (
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={editingUser.phone || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                        data-testid="input-edit-phone"
                      />
                    </div>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select 
                    value={editingUser.status} 
                    onValueChange={(status) => setEditingUser({ ...editingUser, status })}
                  >
                    <SelectTrigger id="status" data-testid="select-edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="vendorStatus">Vendor Status</Label>
                  <Select 
                    value={editingUser.vendorStatus} 
                    onValueChange={(vendorStatus) => setEditingUser({ ...editingUser, vendorStatus })}
                  >
                    <SelectTrigger id="vendorStatus" data-testid="select-edit-vendor-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeDollarBalance">TimeDollar Balance</Label>
                  <Input
                    id="timeDollarBalance"
                    type="number"
                    value={editingUser.timeDollarBalance || 0}
                    onChange={(e) => setEditingUser({ ...editingUser, timeDollarBalance: parseInt(e.target.value) || 0 })}
                    data-testid="input-edit-balance"
                  />
                </div>
                <div>
                  <Label htmlFor="tdCashSplitPercentage">TD/Cash Split % (Cash)</Label>
                  <Input
                    id="tdCashSplitPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={editingUser.tdCashSplitPercentage || 50}
                    onChange={(e) => setEditingUser({ ...editingUser, tdCashSplitPercentage: parseInt(e.target.value) || 50 })}
                    data-testid="input-edit-split"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={editingUser.bio || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, bio: e.target.value })}
                  rows={3}
                  data-testid="textarea-edit-bio"
                />
              </div>
              
              <div>
                <Label htmlFor="profileImageUrl">Profile Image URL</Label>
                <Input
                  id="profileImageUrl"
                  value={editingUser.profileImageUrl || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, profileImageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  data-testid="input-edit-image-url"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)} data-testid="button-cancel-edit">
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateUser} 
              disabled={updateUserMutation.isPending}
              data-testid="button-save-edit"
            >
              {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetPasswordUser} onOpenChange={(open) => !open && setResetPasswordUser(null)}>
        <DialogContent data-testid="dialog-reset-password">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {resetPasswordUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="newPassword">New Password *</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                data-testid="input-new-password"
              />
              <p className="text-sm text-gray-500 mt-1">Minimum 6 characters</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setResetPasswordUser(null);
              setNewPassword("");
            }} data-testid="button-cancel-reset">
              Cancel
            </Button>
            <Button 
              onClick={handleResetPassword} 
              disabled={resetPasswordMutation.isPending || !newPassword}
              data-testid="button-confirm-reset"
            >
              {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
