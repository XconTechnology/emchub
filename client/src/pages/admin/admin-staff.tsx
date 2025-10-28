import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserPlus, Edit, Trash2, Calendar, Shield, FileText } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User, InsertStaff, StaffRoleUpdate } from "@shared/schema";
import { staffInsertSchema, staffRoleUpdateSchema } from "@shared/schema";
import { useLocation } from "wouter";

const STAFF_ROLES = [
  { value: "support", label: "Support", description: "Access to Support Tickets only" },
  { value: "sales", label: "Sales", description: "Access to Refunds/Transactions only" },
  { value: "mediator", label: "Mediator", description: "Access to TimeDollar Disputes only" },
  { value: "listings", label: "Listings", description: "Access to Listing Approvals and Categories only" },
  { value: "full_admin", label: "Full Admin", description: "Access to all admin features except Super Admin settings" },
] as const;

export default function AdminStaff() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);

  const { data: staffUsers = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/staff'],
  });

  const createForm = useForm<InsertStaff>({
    resolver: zodResolver(staffInsertSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "staff",
      staffRole: "support",
      status: "active",
    },
  });

  const editForm = useForm<StaffRoleUpdate>({
    resolver: zodResolver(staffRoleUpdateSchema),
    defaultValues: {
      staffRole: "support",
    },
  });

  const createStaffMutation = useMutation({
    mutationFn: async (data: InsertStaff) => {
      const res = await apiRequest('POST', '/api/staff/create', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff'] });
      toast({
        title: "Success",
        description: "Staff account created successfully",
      });
      setCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create staff account",
        variant: "destructive",
      });
    },
  });

  const updateStaffMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: StaffRoleUpdate }) => {
      const res = await apiRequest('PUT', `/api/staff/${userId}/role`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff'] });
      toast({
        title: "Success",
        description: "Staff role updated successfully",
      });
      setEditDialogOpen(false);
      setSelectedStaff(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update staff role",
        variant: "destructive",
      });
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest('DELETE', `/api/staff/${userId}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff'] });
      toast({
        title: "Success",
        description: "Staff account deleted successfully",
      });
      setDeleteDialogOpen(false);
      setSelectedStaff(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete staff account",
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

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case "support": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "sales": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "mediator": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "listings": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "full_admin": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const handleCreateStaff = (data: InsertStaff) => {
    createStaffMutation.mutate(data);
  };

  const handleEditStaff = (data: StaffRoleUpdate) => {
    if (!selectedStaff) return;
    updateStaffMutation.mutate({ userId: selectedStaff.id, data });
  };

  const handleDeleteStaff = () => {
    if (!selectedStaff) return;
    deleteStaffMutation.mutate(selectedStaff.id);
  };

  const openEditDialog = (staff: User) => {
    setSelectedStaff(staff);
    editForm.reset({ staffRole: staff.staffRole as any || "support" });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (staff: User) => {
    setSelectedStaff(staff);
    setDeleteDialogOpen(true);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Staff Management
          </h2>
          <p className="text-muted-foreground mt-2">
            Create and manage staff accounts with role-based access control
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setLocation('/admin/audit-logs')}
            variant="outline"
            data-testid="button-view-audit-logs"
          >
            <FileText className="w-4 h-4 mr-2" />
            View Audit Logs
          </Button>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            data-testid="button-create-staff"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create Staff Account
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Staff Accounts ({staffUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {staffUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No staff accounts yet</p>
              <p className="text-sm">Create your first staff account to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffUsers.map((staff) => (
                  <TableRow key={staff.id} data-testid={`staff-row-${staff.id}`}>
                    <TableCell className="font-medium">{staff.username}</TableCell>
                    <TableCell>{staff.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(staff.staffRole)}>
                        {STAFF_ROLES.find(r => r.value === staff.staffRole)?.label || staff.staffRole}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatDate(staff.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={staff.status === "active" ? "default" : "secondary"}>
                        {staff.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(staff)}
                          data-testid={`button-edit-${staff.id}`}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(staff)}
                          data-testid={`button-delete-${staff.id}`}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Staff Role Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Role Descriptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {STAFF_ROLES.map((role) => (
            <div key={role.value} className="flex items-start gap-3 p-3 border rounded-lg">
              <Badge className={getRoleBadgeColor(role.value)}>{role.label}</Badge>
              <p className="text-sm text-muted-foreground flex-1">{role.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Create Staff Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent data-testid="dialog-create-staff">
          <DialogHeader>
            <DialogTitle>Create Staff Account</DialogTitle>
            <DialogDescription>
              Create a new staff account with role-based access control
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateStaff)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter username" data-testid="input-username" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="Enter email" data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password *</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="Min. 6 characters" data-testid="input-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="staffRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff Role *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-staff-role">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STAFF_ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">{role.label}</span>
                              <span className="text-xs text-muted-foreground">{role.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  data-testid="button-cancel-create"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createStaffMutation.isPending}
                  data-testid="button-submit-create"
                >
                  {createStaffMutation.isPending ? "Creating..." : "Create Staff"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent data-testid="dialog-edit-staff">
          <DialogHeader>
            <DialogTitle>Edit Staff Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedStaff?.username}
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditStaff)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="staffRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff Role</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-staff-role">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STAFF_ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">{role.label}</span>
                              <span className="text-xs text-muted-foreground">{role.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateStaffMutation.isPending}
                  data-testid="button-submit-edit"
                >
                  {updateStaffMutation.isPending ? "Updating..." : "Update Role"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Staff Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-staff">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Account?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the staff account for <strong>{selectedStaff?.username}</strong>?
              This action cannot be undone and will remove all their access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStaff}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteStaffMutation.isPending ? "Deleting..." : "Delete Staff"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
