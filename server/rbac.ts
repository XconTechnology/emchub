// Role-Based Access Control (RBAC) for Staff

import type { Request, Response, NextFunction } from 'express';

// Define staff roles and their permissions
export const StaffRoles = {
  INDIVIDUAL: 'individual',
  BUSINESS: 'business',
  SUPPORT: 'support',
  SALES: 'sales',
  MEDIATOR: 'mediator',
  FULL_ADMIN: 'full_admin',
} as const;

// Define resource types that staff can access
export const Resources = {
  SUPPORT_TICKETS: 'support_tickets',
  REFUNDS: 'refunds',
  DISPUTES: 'disputes',
  LISTINGS: 'listings',
  USERS: 'users',
  COUPONS: 'coupons',
  VENDORS: 'vendors',
  ANALYTICS: 'analytics',
  ACTIVITY_LOGS: 'activity_logs',
  CATEGORIES: 'categories',
} as const;

// Define which resources each staff role can access
export const RolePermissions: Record<string, string[]> = {
  [StaffRoles.INDIVIDUAL]: [Resources.USERS],
  [StaffRoles.BUSINESS]: [Resources.VENDORS, Resources.COUPONS],
  [StaffRoles.SUPPORT]: [Resources.SUPPORT_TICKETS],
  [StaffRoles.SALES]: [Resources.REFUNDS],
  [StaffRoles.MEDIATOR]: [Resources.DISPUTES],
  [StaffRoles.FULL_ADMIN]: [
    Resources.SUPPORT_TICKETS,
    Resources.REFUNDS,
    Resources.DISPUTES,
    Resources.USERS,
    Resources.COUPONS,
    Resources.VENDORS,
    Resources.ANALYTICS,
    Resources.ACTIVITY_LOGS,
  ],
};

// Check if a staff role has access to a resource
export function hasAccess(staffRole: string | null | undefined, resource: string): boolean {
  if (!staffRole) return false;
  const permissions = RolePermissions[staffRole];
  return permissions ? permissions.includes(resource) : false;
}

// Middleware to check if user is staff with proper authentication
export function isStaffAuthenticated(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  if (user.role !== 'staff') {
    return res.status(403).json({ message: "Staff access required" });
  }
  
  if (!user.staffRole) {
    return res.status(403).json({ message: "Invalid staff role" });
  }
  
  next();
}

// Middleware factory to check if staff has access to a specific resource
export function requireStaffAccess(resource: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user || user.role !== 'staff') {
      return res.status(403).json({ message: "Staff access required" });
    }
    
    if (!hasAccess(user.staffRole, resource)) {
      return res.status(403).json({ 
        message: `Access denied. Your role (${user.staffRole}) does not have permission to access this resource.` 
      });
    }
    
    next();
  };
}

// Middleware to check if user is Super Admin (can manage staff)
export function isSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  
  // Only allow actual super-admin users, NOT regular admin session
  // Session-based admin (admin/admin123) is NOT a super admin
  if (user?.role === 'super-admin') {
    return next();
  }
  
  return res.status(403).json({ message: "Super Admin access required. Only Super Admin users can access this resource." });
}

// Get accessible menu items for a staff role
export function getAccessibleMenuItems(staffRole: string | null | undefined): string[] {
  if (!staffRole) return [];
  
  const menuMap: Record<string, string[]> = {
    [StaffRoles.INDIVIDUAL]: ['users'],
    [StaffRoles.BUSINESS]: ['vendors', 'coupons'],
    [StaffRoles.SUPPORT]: ['support-tickets'],
    [StaffRoles.SALES]: ['refunds', 'transactions'],
    [StaffRoles.MEDIATOR]: ['disputes'],
    [StaffRoles.FULL_ADMIN]: [
      'support-tickets',
      'refunds',
      'transactions',
      'disputes',
      'users',
      'vendors',
      'coupons',
      'analytics',
      'activity-logs',
    ],
  };
  
  return menuMap[staffRole] || [];
}
