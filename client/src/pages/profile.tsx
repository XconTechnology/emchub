import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, MapPin, Phone, Mail, Globe, Edit, Trash2, Plus, Clock, CheckCircle, XCircle, Package, Briefcase, DollarSign, ShieldCheck, AlertCircle, User as UserIcon, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import AddListingModal from "@/components/AddListingModal";
import AddProductModal from "@/components/AddProductModal";
import AddServiceModal from "@/components/AddServiceModal";
import { BecomeVendorModal } from "@/components/BecomeVendorModal";
import DashboardLayout from "@/components/DashboardLayout";
import { ProfilePictureUpload } from "@/components/ProfilePictureUpload";
import type { Listing } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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

export default function Profile() {
  const { user, isLoading } = useAuth();
  const [isAddListingModalOpen, setIsAddListingModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [isBecomeVendorModalOpen, setIsBecomeVendorModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Listing | null>(null);
  const [itemToEdit, setItemToEdit] = useState<Listing | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('openVendor') === 'true') {
      setIsBecomeVendorModalOpen(true);
      window.history.replaceState({}, '', '/profile');
    }
  }, []);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const { data: listings, isLoading: loadingListings, refetch } = useQuery<Listing[]>({
    queryKey: ['/api/listings/user'],
    enabled: !!user,
    refetchInterval: 5000,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      return apiRequest("PATCH", "/api/users/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Profile updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      setIsEditingProfile(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete listing');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings/user'] });
      toast({
        title: "Success!",
        description: "Listing deleted successfully",
      });
      setItemToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete listing",
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return apiRequest("POST", "/api/update-password", data);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Password updated successfully",
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsChangingPassword(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
      case 'published':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Published</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return 'N/A';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const listingItems = listings?.filter(item => item.type === 'listing') || [];
  const productItems = listings?.filter(item => item.type === 'product') || [];
  const serviceItems = listings?.filter(item => item.type === 'service') || [];

  const renderItemCard = (item: Listing) => (
    <Card key={item.id} className="hover:shadow-lg transition-shadow" data-testid={`my-listing-${item.id}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg" data-testid={`listing-title-${item.id}`}>
              {item.title}
            </CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              {getStatusBadge(item.status || item.moderationStatus)}
              <Badge variant="outline" className="text-xs capitalize">
                {item.type}
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setItemToEdit(item);
                if (item.type === 'listing') setIsAddListingModalOpen(true);
                else if (item.type === 'product') setIsAddProductModalOpen(true);
                else if (item.type === 'service') setIsAddServiceModalOpen(true);
              }}
              data-testid={`button-edit-${item.id}`}
              disabled={item.status === 'pending'}
              title={item.status === 'pending' ? 'Cannot edit while pending review' : 'Edit listing'}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setItemToDelete(item)}
              data-testid={`button-delete-${item.id}`}
              disabled={item.status === 'pending'}
              title={item.status === 'pending' ? 'Cannot delete while pending review' : 'Delete listing'}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {item.images && item.images.length > 0 && (
          <img src={item.images[0]} alt={item.title} className="w-full h-40 object-cover rounded-lg" />
        )}

        {item.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {item.description}
          </p>
        )}

        {item.type === 'product' && (
          <div className="flex justify-between items-center text-sm">
            <span className="font-semibold text-lg text-primary">${item.price}</span>
            <span className="text-gray-500">Stock: {item.inventory || 0}</span>
          </div>
        )}

        {item.type === 'service' && item.price && (
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg text-primary">${item.price}</span>
              {item.duration && (
                <span className="text-sm text-gray-500">{item.duration} mins</span>
              )}
            </div>
          </div>
        )}
        
        <Separator />
        
        <div className="space-y-2 text-sm">
          {item.address && item.city && (
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{item.address}, {item.city}</span>
            </div>
          )}
          
          {item.isOnlineOnly && (
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>Online/Remote Service</span>
            </div>
          )}
          
          {item.phone && (
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{item.phone}</span>
            </div>
          )}
          
          {item.email && (
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{item.email}</span>
            </div>
          )}
          
          {item.website && (
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
              <a 
                href={item.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline truncate"
              >
                Visit Website
              </a>
            </div>
          )}
        </div>

        {item.tags && Array.isArray(item.tags) && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {item.tags.slice(0, 3).map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{item.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex justify-between items-center pt-2 text-xs text-gray-400">
          <span>Created: {formatDate(item.createdAt)}</span>
          {item.moderatedAt && (
            <span>Reviewed: {formatDate(item.moderatedAt)}</span>
          )}
        </div>

        {item.status === 'rejected' && item.moderationNotes && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
            <strong className="text-red-800">Rejection Reason:</strong>
            <p className="text-red-700 mt-1">{item.moderationNotes}</p>
          </div>
        )}

        {item.status === 'pending' && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <p className="text-yellow-700">Your listing is under review. You'll be notified once it's approved.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderEmptyState = (type: string, icon: React.ReactNode, onAdd: () => void) => (
    <Card className="text-center py-12">
      <CardContent>
        <div className="text-gray-300 mb-4 flex justify-center">
          {icon}
        </div>
        <CardTitle className="mb-2">No {type}s Yet</CardTitle>
        <CardDescription className="mb-4">
          Start by adding your first {type.toLowerCase()}
        </CardDescription>
        <Button 
          onClick={onAdd}
          className="bg-primary hover:bg-primary/90"
          data-testid={`button-add-first-${type.toLowerCase()}`}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Your First {type}
        </Button>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md wp-card">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Please sign in to view your profile and manage your listings.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.href = '/'}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
        {/* Editable Profile Section */}
        <Card className="wp-card mb-6 shadow-lg border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
              {!isEditingProfile && (
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditingProfile(true)}
                  className="hover:bg-gray-100 transition-colors"
                  data-testid="button-edit-profile"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="flex flex-col items-center gap-3">
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-gray-100"
                    data-testid="img-profile-picture"
                  />
                ) : (
                  <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-lg border-4 border-gray-100">
                    <span className="text-3xl font-bold text-white">
                      {profileData.firstName?.[0]}{profileData.lastName?.[0] || user?.username?.[0]}
                    </span>
                  </div>
                )}
                <ProfilePictureUpload currentImageUrl={user?.profileImageUrl} />
              </div>
              <div className="flex gap-2">
                {user?.isAdmin && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1 text-sm font-medium">
                    Administrator
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                {isEditingProfile ? (
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    data-testid="input-first-name"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium" data-testid="text-first-name">
                    {profileData.firstName || 'Not set'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                {isEditingProfile ? (
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    data-testid="input-last-name"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium" data-testid="text-last-name">
                    {profileData.lastName || 'Not set'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                {isEditingProfile ? (
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    data-testid="input-email-profile"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium" data-testid="text-email">
                    {profileData.email || 'Not set'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                {isEditingProfile ? (
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    data-testid="input-phone-profile"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium" data-testid="text-phone">
                    {profileData.phone || 'Not set'}
                  </p>
                )}
              </div>
            </div>

            {isEditingProfile && (
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileData({
                      firstName: user.firstName || '',
                      lastName: user.lastName || '',
                      email: user.email || '',
                      phone: user.phone || '',
                    });
                  }}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => updateProfileMutation.mutate(profileData)}
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vendor Status Section */}
        <Card className="wp-card mb-6 shadow-lg border-0 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold">Vendor Status</CardTitle>
          </CardHeader>
          <CardContent>
            {user?.vendorStatus === 'verified' ? (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-green-600" />
                  </div>
                  <div>
                    <Badge variant="secondary" className="bg-green-600 text-white px-4 py-1.5 text-sm font-semibold mb-1" data-testid="badge-verified-vendor">
                      Verified Vendor ✅
                    </Badge>
                    <p className="text-sm text-green-700 mt-2">You can now list products and services on the platform</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {user?.vendorStatus === 'pending' && (
                  <div className="flex items-center gap-3 px-5 py-4 bg-yellow-50 border-2 border-yellow-200 rounded-2xl shadow-sm" data-testid="vendor-status-pending">
                    <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <span className="text-yellow-800 font-medium">Your vendor verification request has been submitted for review.</span>
                  </div>
                )}
                {user?.vendorStatus === 'rejected' && (
                  <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border-2 border-red-200 rounded-2xl shadow-sm" data-testid="vendor-status-rejected">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <span className="text-red-800 font-medium">Your vendor verification request was rejected.</span>
                  </div>
                )}
                {user?.vendorStatus === 'none' && (
                  <div className="px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl">
                    <p className="text-gray-700 font-medium">You are not currently a vendor. Apply to become a verified vendor to start selling your products and services.</p>
                  </div>
                )}
                <Button 
                  onClick={() => setIsBecomeVendorModalOpen(true)}
                  className="bg-[hsl(86,49%,53%)] hover:bg-[hsl(86,49%,48%)] shadow-md hover:shadow-lg transition-all"
                  data-testid="button-become-vendor"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  {user?.vendorStatus === 'rejected' ? 'Reapply for Vendor Status' : 'Become a Vendor'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security - Change Password */}
        <Card className="wp-card mb-6 shadow-lg border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <Lock className="w-5 h-5" />
                  Security
                </CardTitle>
                <CardDescription className="mt-1.5">Manage your password and security settings</CardDescription>
              </div>
              {!isChangingPassword && (
                <Button 
                  variant="outline" 
                  onClick={() => setIsChangingPassword(true)}
                  data-testid="button-change-password"
                >
                  Change Password
                </Button>
              )}
            </div>
          </CardHeader>
          {isChangingPassword && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    data-testid="input-current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    data-testid="input-new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {passwordData.newPassword && passwordData.newPassword.length < 6 && (
                  <p className="text-sm text-red-500">Password must be at least 6 characters</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    data-testid="input-confirm-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                  <p className="text-sm text-red-500">Passwords do not match</p>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  data-testid="button-cancel-password"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (passwordData.newPassword !== passwordData.confirmPassword) {
                      toast({
                        title: "Error",
                        description: "Passwords do not match",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (passwordData.newPassword.length < 6) {
                      toast({
                        title: "Error",
                        description: "Password must be at least 6 characters",
                        variant: "destructive",
                      });
                      return;
                    }
                    changePasswordMutation.mutate({
                      currentPassword: passwordData.currentPassword,
                      newPassword: passwordData.newPassword,
                    });
                  }}
                  disabled={changePasswordMutation.isPending || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  data-testid="button-save-password"
                >
                  {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Verified Vendor Actions */}
        {user?.vendorStatus === 'verified' && (
          <Card className="wp-card mb-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Add new listings, products, or services</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2 flex-wrap">
              <Button 
                onClick={() => setIsAddListingModalOpen(true)}
                className="bg-[hsl(86,49%,53%)] hover:bg-[hsl(86,49%,48%)]"
                data-testid="button-add-listing"
              >
                <Store className="w-4 h-4 mr-2" />
                Add Listing
              </Button>
              <Button 
                onClick={() => setIsAddProductModalOpen(true)}
                className="bg-[hsl(86,49%,53%)] hover:bg-[hsl(86,49%,48%)]"
                data-testid="button-add-product"
              >
                <Package className="w-4 h-4 mr-2" />
                Add Product
              </Button>
              <Button 
                onClick={() => setIsAddServiceModalOpen(true)}
                className="bg-[hsl(86,49%,53%)] hover:bg-[hsl(86,49%,48%)]"
                data-testid="button-add-service"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tabs for Listings, Products, Services - Only for verified vendors */}
        {user?.vendorStatus === 'verified' ? (
          <Tabs defaultValue="listings" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
              <TabsTrigger value="listings" data-testid="tab-listings">
                Listings ({listingItems.length})
              </TabsTrigger>
              <TabsTrigger value="products" data-testid="tab-products">
                Products ({productItems.length})
              </TabsTrigger>
              <TabsTrigger value="services" data-testid="tab-services">
                Services ({serviceItems.length})
              </TabsTrigger>
            </TabsList>

          <TabsContent value="listings">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                My Listings
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your business listings
              </p>
            </div>

            {loadingListings ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : listingItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listingItems.map(renderItemCard)}
              </div>
            ) : (
              renderEmptyState('Listing', <Store className="w-16 h-16" />, () => setIsAddListingModalOpen(true))
            )}
          </TabsContent>

          <TabsContent value="products">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                My Products
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your product catalog
              </p>
            </div>

            {loadingListings ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : productItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productItems.map(renderItemCard)}
              </div>
            ) : (
              renderEmptyState('Product', <Package className="w-16 h-16" />, () => setIsAddProductModalOpen(true))
            )}
          </TabsContent>

          <TabsContent value="services">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                My Services
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your service offerings
              </p>
            </div>

            {loadingListings ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : serviceItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {serviceItems.map(renderItemCard)}
              </div>
            ) : (
              renderEmptyState('Service', <Briefcase className="w-16 h-16" />, () => setIsAddServiceModalOpen(true))
            )}
          </TabsContent>
        </Tabs>
        ) : null}

        <AddListingModal 
          isOpen={isAddListingModalOpen}
          onClose={() => {
            setIsAddListingModalOpen(false);
            setItemToEdit(null);
          }}
        />

        <AddProductModal 
          isOpen={isAddProductModalOpen}
          onClose={() => {
            setIsAddProductModalOpen(false);
            setItemToEdit(null);
          }}
        />

        <AddServiceModal 
          isOpen={isAddServiceModalOpen}
          onClose={() => {
            setIsAddServiceModalOpen(false);
            setItemToEdit(null);
          }}
        />

        <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your listing.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => itemToDelete && deleteMutation.mutate(itemToDelete.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <BecomeVendorModal 
          isOpen={isBecomeVendorModalOpen}
          onClose={() => setIsBecomeVendorModalOpen(false)}
        />
      </div>
  );
}
